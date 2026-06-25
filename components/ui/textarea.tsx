import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-[10px] border border-input bg-surface-2 px-[13px] py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors",
        "placeholder:text-faint focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
