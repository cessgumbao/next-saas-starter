import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-input bg-surface-2 px-[13px] py-2 text-sm text-foreground outline-none transition-colors",
        "placeholder:text-faint focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-bad",
        className
      )}
      {...props}
    />
  );
}

export { Input };
