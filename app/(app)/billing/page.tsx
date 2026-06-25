"use client";

import { useState } from "react";
import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/app/logo";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type Plan = {
  id: "starter" | "pro" | "business";
  name: string;
  tagline: string;
  m: number;
  y: number;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individuals getting started.",
    m: 19,
    y: 15,
    features: ["Up to 3 seats", "5 projects", "Community support", "Basic analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing teams that need more.",
    m: 49,
    y: 39,
    features: [
      "Up to 10 seats",
      "Unlimited projects",
      "Role-based permissions",
      "Priority email support",
      "Advanced analytics",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For organizations at scale.",
    m: 99,
    y: 79,
    features: [
      "Unlimited seats",
      "SSO & SAML",
      "Audit logs",
      "Dedicated success manager",
      "99.99% uptime SLA",
    ],
  },
];

const order = ["starter", "pro", "business"] as const;

const invoices = [
  { id: "INV-2026-0612", date: "Jun 1, 2026", amount: "$49.00" },
  { id: "INV-2026-0511", date: "May 1, 2026", amount: "$49.00" },
  { id: "INV-2026-0410", date: "Apr 1, 2026", amount: "$49.00" },
  { id: "INV-2026-0309", date: "Mar 1, 2026", amount: "$49.00" },
  { id: "INV-2026-0208", date: "Feb 1, 2026", amount: "$49.00" },
];

export default function BillingPage() {
  const { toast } = useWorkspace();
  const [yearly, setYearly] = useState(false);
  const [plan, setPlan] = useState<Plan["id"]>("pro");
  const [checkout, setCheckout] = useState<Plan["id"] | null>(null);

  const current = plans.find((p) => p.id === plan)!;
  const checkoutPlan = checkout ? plans.find((p) => p.id === checkout)! : null;

  function confirmCheckout() {
    if (!checkoutPlan) return;
    setPlan(checkoutPlan.id);
    toast("Subscribed to " + checkoutPlan.name);
    setCheckout(null);
  }

  return (
    <div>
      {/* Current plan + payment method */}
      <div className="mb-6 grid grid-cols-[1.4fr_1fr] gap-[18px]">
        <Card className="p-[22px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[12.5px] font-medium text-muted-foreground">
                Current plan
              </div>
              <div className="mt-[5px] flex items-baseline gap-2.5">
                <span className="text-[26px] font-bold tracking-[-0.02em]">
                  {current.name}
                </span>
                <Badge>Active</Badge>
              </div>
              <div className="mt-2 text-[13px] text-muted-foreground">
                ${yearly ? current.y : current.m}/mo · renews Jul 1, 2026
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Manage
            </Button>
          </div>
          <div className="my-[18px] h-px bg-border" />
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">Seats used</span>
            <span className="text-[13px] font-semibold">8 of 10</span>
          </div>
          <div className="h-2 overflow-hidden rounded-[5px] bg-surface-3">
            <div className="h-full w-[80%] rounded-[5px] bg-primary" />
          </div>
        </Card>

        <Card className="p-[22px]">
          <div className="mb-3.5 text-[12.5px] font-medium text-muted-foreground">
            Payment method
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-8 w-12 flex-none items-center justify-center rounded-[7px] bg-[linear-gradient(135deg,#1b1726,#403455)]">
              <div className="flex">
                <div className="size-[11px] rounded-full bg-[#eb5757] opacity-95" />
                <div className="-ml-[5px] size-[11px] rounded-full bg-[#f2994a] opacity-85" />
              </div>
            </div>
            <div>
              <div className="font-mono text-[13.5px] font-semibold">
                •••• •••• •••• 4242
              </div>
              <div className="text-xs text-muted-foreground">Expires 09 / 28</div>
            </div>
          </div>
          <Button variant="secondary" className="mt-4 w-full">
            Update card
          </Button>
        </Card>
      </div>

      {/* Plans header + billing cycle toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base font-bold tracking-[-0.01em]">Plans</div>
        <div className="flex items-center gap-2 rounded-[10px] border border-border bg-surface-2 p-1">
          <CycleTab active={!yearly} onClick={() => setYearly(false)}>
            Monthly
          </CycleTab>
          <CycleTab active={yearly} onClick={() => setYearly(true)}>
            Yearly <span className="text-[10.5px] opacity-80">−20%</span>
          </CycleTab>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-[18px]">
        {plans.map((p) => {
          const isCurrent = p.id === plan;
          const price = yearly ? p.y : p.m;
          const isDowngrade = order.indexOf(p.id) < order.indexOf(plan);
          const accent = p.id === "pro" || p.id === "business";
          return (
            <Card
              key={p.id}
              className={cn(
                "relative p-[22px]",
                isCurrent && "border-2 border-primary"
              )}
            >
              {isCurrent && (
                <div className="absolute right-3.5 top-3.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-primary">
                  Current
                </div>
              )}
              <div className="text-[15px] font-bold">{p.name}</div>
              <div className="mt-1 min-h-[34px] text-[12.5px] leading-snug text-muted-foreground">
                {p.tagline}
              </div>
              <div className="mb-1 mt-3.5 flex items-baseline gap-1">
                <span className="text-[32px] font-bold tracking-[-0.03em]">
                  ${price}
                </span>
                <span className="text-[13px] text-muted-foreground">/ mo</span>
              </div>
              <div className="min-h-4 text-[11.5px] text-faint">
                {yearly ? `billed annually ($${p.y * 12}/yr)` : ""}
              </div>
              <Button
                className="mt-4 w-full"
                disabled={isCurrent}
                variant={isCurrent ? "secondary" : accent ? "default" : "secondary"}
                onClick={() => p.id !== plan && setCheckout(p.id)}
              >
                {isCurrent ? "Current plan" : isDowngrade ? "Downgrade" : "Upgrade"}
              </Button>
              <div className="my-4 h-px bg-border" />
              <div className="flex flex-col gap-2.5">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check
                      className="mt-px size-4 flex-none text-primary"
                      strokeWidth={2.4}
                    />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invoices */}
      <div className="mb-3 mt-7 text-[13px] font-semibold">Invoices</div>
      <Card className="overflow-hidden p-0">
        {invoices.map((iv) => (
          <div
            key={iv.id}
            className="grid grid-cols-[1.4fr_1fr_1fr_100px] items-center border-b border-border px-5 py-[13px] last:border-b-0"
          >
            <div className="text-[13.5px] font-medium">{iv.id}</div>
            <div className="text-[13px] text-muted-foreground">{iv.date}</div>
            <div className="text-[13.5px] font-semibold">{iv.amount}</div>
            <div className="text-right">
              <span className="cursor-pointer text-[13px] font-semibold text-primary">
                Download
              </span>
            </div>
          </div>
        ))}
      </Card>

      {/* Checkout modal */}
      <Dialog
        open={checkout !== null}
        onOpenChange={(o) => !o && setCheckout(null)}
      >
        <DialogContent className="max-w-[430px] overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-[26px] py-[22px]">
            <LogoMark className="size-[30px]" ringClassName="size-[11px]" />
            <DialogTitle className="text-[15px] font-bold tracking-normal">
              Confirm subscription
            </DialogTitle>
          </div>
          <div className="px-[26px] py-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="text-sm font-semibold">
                  {checkoutPlan?.name} plan
                </div>
                <div className="text-[12.5px] text-muted-foreground">
                  {yearly ? "Annual" : "Monthly"} billing
                </div>
              </div>
              <div className="text-[22px] font-bold tracking-[-0.02em]">
                ${checkoutPlan ? (yearly ? checkoutPlan.y : checkoutPlan.m) : 0}/mo
              </div>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[13px] text-muted-foreground">Billed to</span>
              <span className="font-mono text-[13px] font-semibold">•••• 4242</span>
            </div>
            <Button onClick={confirmCheckout} size="lg" className="w-full">
              <Lock className="size-[15px]" strokeWidth={2} />
              Subscribe securely
            </Button>
            <div className="mt-3 text-center text-[11.5px] text-faint">
              Powered by Stripe · cancel anytime
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CycleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg px-3.5 py-[7px] text-[13px] font-semibold transition-colors",
        active
          ? "bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
          : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}
