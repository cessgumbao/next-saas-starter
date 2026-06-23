"use client";

import { Check } from "lucide-react";

import { useWorkspace } from "@/lib/workspace";

export function Toaster() {
  const { toasts } = useWorkspace();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex min-w-[260px] items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-toast animate-in slide-in-from-right-4 fade-in"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-good-soft text-good">
            <Check className="size-3.5" strokeWidth={2.6} />
          </span>
          <span className="text-[13.5px] font-medium text-foreground">
            {t.msg}
          </span>
        </div>
      ))}
    </div>
  );
}
