/**
* This file was automatically generated by @cosmwasm/ts-codegen@1.12.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { Coin } from "@cosmjs/amino";
import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";
import { InstantiateMsg, ExecuteMsg, Uint128, Binary, Decimal, AssetInfo, Addr, Cw20ReceiveMsg, SwapOperation, QueryMsg, SimulateSwapOperationsResponse } from "./AstroportRouter.types";
export interface AstroportRouterMsg {
  contractAddress: string;
  sender: string;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, funds_?: Coin[]) => MsgExecuteContractEncodeObject;
  executeSwapOperations: ({
    maxSpread,
    minimumReceive,
    operations,
    to
  }: {
    maxSpread?: Decimal;
    minimumReceive?: Uint128;
    operations: SwapOperation[];
    to?: string;
  }, funds_?: Coin[]) => MsgExecuteContractEncodeObject;
  executeSwapOperation: ({
    maxSpread,
    operation,
    single,
    to
  }: {
    maxSpread?: Decimal;
    operation: SwapOperation;
    single: boolean;
    to?: string;
  }, funds_?: Coin[]) => MsgExecuteContractEncodeObject;
}
export class AstroportRouterMsgComposer implements AstroportRouterMsg {
  sender: string;
  contractAddress: string;
  constructor(sender: string, contractAddress: string) {
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.executeSwapOperations = this.executeSwapOperations.bind(this);
    this.executeSwapOperation = this.executeSwapOperation.bind(this);
  }
  receive = ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, funds_?: Coin[]): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(JSON.stringify({
          receive: {
            amount,
            msg,
            sender
          }
        })),
        funds: funds_
      })
    };
  };
  executeSwapOperations = ({
    maxSpread,
    minimumReceive,
    operations,
    to
  }: {
    maxSpread?: Decimal;
    minimumReceive?: Uint128;
    operations: SwapOperation[];
    to?: string;
  }, funds_?: Coin[]): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(JSON.stringify({
          execute_swap_operations: {
            max_spread: maxSpread,
            minimum_receive: minimumReceive,
            operations,
            to
          }
        })),
        funds: funds_
      })
    };
  };
  executeSwapOperation = ({
    maxSpread,
    operation,
    single,
    to
  }: {
    maxSpread?: Decimal;
    operation: SwapOperation;
    single: boolean;
    to?: string;
  }, funds_?: Coin[]): MsgExecuteContractEncodeObject => {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender: this.sender,
        contract: this.contractAddress,
        msg: toUtf8(JSON.stringify({
          execute_swap_operation: {
            max_spread: maxSpread,
            operation,
            single,
            to
          }
        })),
        funds: funds_
      })
    };
  };
}