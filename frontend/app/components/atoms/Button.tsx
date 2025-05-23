"use client";
import { extendVariants, Button as NextButton } from "@heroui/react";

export const Button = extendVariants(NextButton, {
  variants: {
    color: {
      primary: "outline-none focus:outline-none",
      secondary: "outline-none focus:outline-none",
      tertiary: "outline-none focus:outline-none",
    },
    isDisabled: {
      true: "!bg-white/10 z-10 relative backdrop-blur-md !text-white/70 !hover:bg-white/10 cursor-not-allowed ",
    },
    variant: {},
    isIconOnly: {
      true: "p-1 h-fit w-fit min-w-fit",
    },
    size: {
      xs: "text-xs py-1 px-2",
      sm: "text-xs py-1 px-2",
      md: "text-sm py-3 px-3",
      lg: "text-lg py-4 px-4",
      icon: "p-1 min-h-fit min-w-fit",
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
    radius: "full",
  },
  compoundVariants: [
    {
      color: "secondary",
      class: "bg-tw-orange-400/20 text-tw-orange-400 hover:bg-tw-orange-400/10",
    },
    {
      color: "tertiary",
      class: "bg-white/10 text-white",
    },
    {
      color: "primary",
      class: "bg-tw-orange-400 text-tw-bg font-medium -tracking-wide",
    },
    {
      variant: "faded",
      color: "primary",
      class: "border-white/10 bg-tw-gray-900 text-tw-orange-500 hover:opacity-hover",
    },
    {
      variant: "flat",
      color: "primary",
      class:
        "bg-tw-orange-400/10 text-tw-orange-400 hover:opacity-hover font-medium -tracking-wide",
    },
    {
      variant: "ghost",
      color: "primary",
      class:
        "bg-transparent border-tw-orange-400 text-tw-orange-400 hover:!bg-tw-orange-400 hover:!text-tw-bg",
    },
    {
      variant: "ghost",
      color: "tertiary",
      class: "bg-transparent border-tw-gray-900 text-white hover:!bg-tw-gray-900",
    },
    {
      variant: "light",
      color: "primary",
      class: "bg-transparent hover:text-tw-orange-400 hover:bg-transparent",
    },
  ],
});
