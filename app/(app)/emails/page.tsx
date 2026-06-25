"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmailTemplate = {
  key: string;
  name: string;
  trigger: string;
  subject: string;
  heading: string;
  body: string[];
  cta: string;
};

const emails: EmailTemplate[] = [
  {
    key: "welcome",
    name: "Welcome",
    trigger: "On sign up",
    subject: "Welcome to Aura",
    heading: "Welcome aboard, Jordan",
    body: [
      "Thanks for signing up for Aura. Your workspace is ready and waiting.",
      "Get started by inviting your team and connecting your first project — it only takes a minute.",
    ],
    cta: "Set up your workspace",
  },
  {
    key: "invite",
    name: "Team invite",
    trigger: "On member invite",
    subject: "You've been invited to Northwind Labs",
    heading: "Join Northwind Labs on Aura",
    body: [
      "Mara Chen has invited you to collaborate in the Northwind Labs workspace as a Member.",
      "Accept the invitation to get access to projects, billing and team tools.",
    ],
    cta: "Accept invitation",
  },
  {
    key: "receipt",
    name: "Payment receipt",
    trigger: "On successful charge",
    subject: "Your Aura receipt — June 2026",
    heading: "Payment received",
    body: [
      "We received your payment of $49.00 for the Pro plan. Thank you!",
      "Your subscription renews on July 1, 2026. You can manage billing anytime from your account.",
    ],
    cta: "View invoice",
  },
  {
    key: "reset",
    name: "Password reset",
    trigger: "On reset request",
    subject: "Reset your Aura password",
    heading: "Reset your password",
    body: [
      "We got a request to reset the password for your Aura account.",
      "Click the button below to choose a new password. This link expires in 30 minutes. If you didn’t request this, you can safely ignore it.",
    ],
    cta: "Reset password",
  },
  {
    key: "trial",
    name: "Trial ending",
    trigger: "3 days before trial end",
    subject: "Your Aura trial ends in 3 days",
    heading: "Your trial is ending soon",
    body: [
      "Your Aura Pro trial ends in 3 days. Add a payment method to keep your projects, team and data.",
      "Pick a plan that fits — you can change or cancel anytime.",
    ],
    cta: "Choose a plan",
  },
];

export default function EmailsPage() {
  const { toast } = useWorkspace();
  const [selected, setSelected] = useState("welcome");
  const current = emails.find((e) => e.key === selected)!;

  return (
    <div className="grid grid-cols-[280px_1fr] items-start gap-[18px]">
      {/* Template list */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-[13px] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-faint">
          Templates
        </div>
        {emails.map((e) => (
          <button
            key={e.key}
            type="button"
            onClick={() => setSelected(e.key)}
            className={cn(
              "block w-full cursor-pointer border-b border-l-[3px] border-border px-4 py-[13px] text-left transition-colors last:border-b-0",
              selected === e.key
                ? "border-l-primary bg-primary-soft"
                : "border-l-transparent hover:bg-surface-2"
            )}
          >
            <div className="text-[13.5px] font-semibold">{e.name}</div>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              {e.trigger}
            </div>
          </button>
        ))}
      </Card>

      {/* Preview */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-[18px] py-3.5">
          <div>
            <div className="text-[11.5px] text-faint">Subject</div>
            <div className="text-sm font-semibold">{current.subject}</div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast("Test email sent to jordan@northwind.co")}
          >
            <Send className="size-[15px]" strokeWidth={2} /> Send test
          </Button>
        </div>

        {/* Rendered email mockup (fixed light styling, like a real email) */}
        <div className="bg-surface-2 p-[30px]">
          <div className="mx-auto max-w-[480px] overflow-hidden rounded-[14px] bg-white shadow-[0_4px_24px_rgba(27,23,38,0.10)]">
            <div className="h-[5px] bg-[#8b5cf6]" />
            <div className="px-[34px] pb-[34px] pt-[30px]">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-[9px] bg-[#8b5cf6]">
                  <div className="size-[11px] rounded-full border-[3px] border-white border-r-transparent" />
                </div>
                <span className="text-base font-bold text-[#1b1726]">Aura</span>
              </div>
              <div className="mb-3.5 text-[21px] font-bold tracking-[-0.02em] text-[#1b1726]">
                {current.heading}
              </div>
              {current.body.map((para, i) => (
                <p
                  key={i}
                  className="mb-3.5 text-sm leading-[1.65] text-[#4a4458]"
                >
                  {para}
                </p>
              ))}
              <a className="mt-1.5 inline-block cursor-pointer rounded-[10px] bg-[#8b5cf6] px-[22px] py-[11px] text-sm font-semibold text-white">
                {current.cta}
              </a>
              <div className="my-7 mb-4 h-px bg-[#ececf1]" />
              <div className="text-xs leading-[1.6] text-[#9b94aa]">
                You&apos;re receiving this because you have an Aura account.{" "}
                <span className="text-[#8b5cf6]">Manage preferences</span> ·{" "}
                <span className="text-[#8b5cf6]">Unsubscribe</span>
                <br />
                Aura, Inc. · 2261 Market St, San Francisco, CA
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
