"use client";

import { type ComponentProps } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[23px] w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-colors",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-3",
        "focus-visible:ring-2 focus-visible:ring-primary-soft disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-[19px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform",
          "data-[state=checked]:translate-x-[17px] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
