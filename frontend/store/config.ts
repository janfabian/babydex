import { persist, subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { ChainId } from "~/types/chain";
import { Config, CreateConfigParameters, State } from "~/types/config";
import { createStorage } from "./storage";
import { Connector, ConnectorEventMap, CreateConnectorFn } from "~/types/connectors";
import { EventData } from "~/types/emitter";
import { createEmitter } from "./emitter";
import { Client } from "~/types/client";
import { createClient } from "./client";

export function createConfig(parameters: CreateConfigParameters): Config {
  const {
    storage = createStorage({
      storage: typeof window !== "undefined" && window.localStorage ? window.localStorage : undefined,
    }),
    ...rest
  } = parameters;

  //////////////////////////////////////////////////////////////////////////////
  // Set up connectors, clients, etc.
  //////////////////////////////////////////////////////////////////////////////

  const chains = createStore(() => rest.chains);
  const connectors = createStore(() => [...(rest.connectors ?? [])].map(setup));

  function setup(connectorFn: CreateConnectorFn): Connector {
    // Set up emitter with uid and add to connector so they are "linked" together.
    const emitter = createEmitter<ConnectorEventMap>(crypto.randomUUID());
    const connector = {
      ...connectorFn({
        emitter,
        chains: chains.getState(),
        storage,
        transports: rest.transports,
      }),
      emitter,
      uid: emitter.uid,
    };

    // Start listening for `connect` events on connector setup
    // This allows connectors to "connect" themselves without user interaction
    // (e.g. MetaMask's "Manually connect to current site")
    emitter.on("connect", connect);
    connector.setup?.();

    return connector;
  }

  const clients = new Map<string, Client>();

  function getClient(config: { chainId?: string | undefined } = {}): Client {
    const chainId = config.chainId ?? store.getState().chainId;

    if (!chainId) throw new Error("Chain id not provided");

    {
      const client = clients.get(String(chainId));
      if (client) return client;
    }

    const chain = chains.getState().find((x) => x.id === chainId);

    // chainId specified and not configured
    if (config.chainId && !chain) throw new Error("Chain not configured");

    {
      const client = clients.get(String(store.getState().chainId));
      if (client) return client;
    }

    if (!chain) throw new Error("Chain not configured");

    {
      const chainId = chain.id as ChainId;
      const client = createClient({
        chain,
        transport: rest.transports[chainId],
      });

      clients.set(String(chainId), client);
      return client;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Create store
  //////////////////////////////////////////////////////////////////////////////

  function getInitialState(): State {
    return {
      chainId: chains.getState()[0].id,
      connections: new Map(),
      connectors: new Map(),
      status: "disconnected",
    };
  }

  const stateCreator = storage
    ? persist(getInitialState, {
        version: 0,
        name: "store",
        storage,
        partialize(state) {
          const { chainId, connections, connectors, status } = state;
          return {
            chainId,
            status,
            connectors,
            connections: new Map(
              Array.from(connections.entries()).map(([key, connection]) => {
                const { id, name, type, uid } = connection.connector;
                const connector = { id, name, type, uid };
                return [key, { ...connection, connector }];
              })
            ),
          };
        },
        merge(persistedState, currentState) {
          if (!persistedState) return currentState;

          if (typeof persistedState === "object" && "status" in persistedState) {
            delete persistedState.status;
          }

          return {
            ...currentState,
            ...persistedState,
          };
        },
      })
    : getInitialState;

  const store = createStore(subscribeWithSelector(stateCreator));

  //////////////////////////////////////////////////////////////////////////////
  // Emitter listeners
  //////////////////////////////////////////////////////////////////////////////

  function change(data: EventData<ConnectorEventMap, "change">) {
    store.setState((x) => {
      const connection = x.connections.get(data.uid);
      if (!connection) return x;
      const { chainId, uid } = data;
      if (chainId) x.connectors.set(chainId, uid);

      const accounts = data.accounts ?? connection.accounts;
      return {
        ...x,
        connections: new Map(x.connections).set(uid, {
          account: accounts[0],
          accounts,
          connector: connection.connector,
          chainId: chainId ?? connection.chainId,
        }),
      };
    });
  }
  function connect(data: EventData<ConnectorEventMap, "connect">) {
    store.setState((x) => {
      const connector = connectors.getState().find((x) => x.uid === data.uid);
      if (!connector) return x;

      if (connector.emitter.listenerCount("connect")) {
        connector.emitter.off("connect", change);
      }

      if (!connector.emitter.listenerCount("change")) {
        connector.emitter.on("change", change);
      }
      if (!connector.emitter.listenerCount("disconnect")) {
        connector.emitter.on("disconnect", disconnect);
      }

      const previousConnectorId = x.connectors.get(data.chainId);
      if (previousConnectorId) {
        x.connections.delete(previousConnectorId);
      }

      return {
        ...x,
        connections: new Map(x.connections).set(data.uid, {
          account: data.accounts[0],
          accounts: data.accounts,
          chainId: data.chainId,
          connector: connector,
        }),
        chainId: data.chainId,
        connectors: new Map(x.connectors).set(data.chainId, data.uid),
        status: "connected",
      };
    });
  }
  function disconnect(data: EventData<ConnectorEventMap, "disconnect">) {
    store.setState((x) => {
      const connection = x.connections.get(data.uid);
      if (connection) {
        const connector = connection.connector;
        if (connector.emitter.listenerCount("change")) {
          connection.connector.emitter.off("change", change);
        }
        if (connector.emitter.listenerCount("disconnect")) {
          connection.connector.emitter.off("disconnect", disconnect);
        }
        if (!connector.emitter.listenerCount("connect")) {
          connection.connector.emitter.on("connect", connect);
        }
      }

      x.connections.delete(data.uid);

      for (const [chainId, uid] of x.connectors.entries()) {
        if (uid === data.uid) x.connectors.delete(chainId);
      }

      if (x.connections.size === 0) {
        return {
          ...x,
          connections: new Map(),
          chainIdToConnection: new Map(),
          status: "disconnected",
        };
      }

      return {
        ...x,
        chainId: x.connectors.keys().next().value,
        connectors: new Map(x.connectors),
        connections: new Map(x.connections),
      };
    });
  }

  return {
    ssr: !!rest.ssr,
    get store() {
      return store;
    },
    get chains() {
      return chains.getState();
    },
    get connectors() {
      return connectors.getState();
    },
    storage,
    setChainId(chainId) {
      store.setState({ chainId });
    },
    getClient,
    get state() {
      return store.getState() as unknown as State;
    },
    setState(value) {
      let newState: State;
      if (typeof value === "function") newState = value(store.getState() as any);
      else newState = value;

      // Reset state if it got set to something not matching the base state
      const initialState = getInitialState();
      if (typeof newState !== "object") newState = initialState;
      const isCorrupt = Object.keys(initialState).some((x) => !(x in newState));
      if (isCorrupt) newState = initialState;

      store.setState(newState, true);
    },
    subscribe(selector, listener, options) {
      return store.subscribe(
        selector as unknown as (state: State) => any,
        listener,
        options
          ? {
              fireImmediately: options.emitImmediately,
            }
          : undefined
      );
    },
  };
}
