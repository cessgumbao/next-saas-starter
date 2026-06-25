"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import { avatarColor, initials } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const adminStats = [
  { label: "Total MRR", value: "$48,290" },
  { label: "Paying customers", value: "1,204" },
  { label: "Trial accounts", value: "186" },
  { label: "30-day churn", value: "1.8%" },
];

type UserStatus = "Active" | "Past_due" | "Trialing";
const users: {
  name: string;
  email: string;
  plan: string;
  status: UserStatus;
  mrr: string;
}[] = [
  { name: "Skyline Co", email: "ops@skyline.co", plan: "Business", status: "Active", mrr: "$99" },
  { name: "Mara Chen", email: "mara@northwind.co", plan: "Pro", status: "Active", mrr: "$49" },
  { name: "Globex Inc", email: "admin@globex.com", plan: "Pro", status: "Past_due", mrr: "$49" },
  { name: "Nova Studio", email: "hi@novastudio.io", plan: "Starter", status: "Active", mrr: "$19" },
  { name: "Tom Beckett", email: "tom@acme.io", plan: "Pro", status: "Trialing", mrr: "$0" },
  { name: "Harbor Labs", email: "team@harbor.dev", plan: "Business", status: "Active", mrr: "$99" },
];

const statusVariant = {
  Active: "success",
  Past_due: "destructive",
  Trialing: "default",
} as const;

const initialFlags = [
  { key: "newDash", name: "New dashboard", desc: "Redesigned analytics home", on: true },
  { key: "aiAssist", name: "AI assistant", desc: "In-app AI helper (beta)", on: false },
  { key: "betaBilling", name: "Usage-based billing", desc: "Metered pricing engine", on: true },
  { key: "ssoEnforce", name: "Enforce SSO", desc: "Require SSO for all members", on: false },
];

export default function AdminPage() {
  const { isAdminAllowed, role, setRole } = useWorkspace();
  const [flags, setFlags] = useState(initialFlags);

  if (!isAdminAllowed) {
    return (
      <Card className="mx-auto mt-10 max-w-[440px] px-10 py-[60px] text-center">
        <div className="mx-auto mb-[18px] flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Lock className="size-[26px]" strokeWidth={1.8} />
        </div>
        <div className="mb-2 text-lg font-bold">Admin access required</div>
        <div className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">
          The admin panel is restricted to workspace Owners. You&apos;re
          currently viewing as <b className="text-foreground">{role}</b>.
        </div>
        <Button onClick={() => setRole("Owner")} size="sm">
          Switch to Owner
        </Button>
      </Card>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="mb-[18px] grid grid-cols-4 gap-[18px]">
        {adminStats.map((s) => (
          <Card key={s.label} className="p-[18px]">
            <div className="text-[12.5px] font-medium text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-[7px] text-[25px] font-bold tracking-[-0.02em]">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1.7fr_1fr] items-start gap-[18px]">
        {/* All users */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-[15px] text-sm font-semibold">
            All users
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-border px-5 py-[11px] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-faint">
            <div>User</div>
            <div>Plan</div>
            <div>Status</div>
            <div>MRR</div>
          </div>
          {users.map((u, i) => (
            <div
              key={u.email}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-border px-5 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex size-[34px] flex-none items-center justify-center rounded-[9px] text-[12.5px] font-semibold text-white"
                  style={{ background: avatarColor(i) }}
                >
                  {initials(u.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold">
                    {u.name}
                  </div>
                  <div className="truncate text-[11.5px] text-muted-foreground">
                    {u.email}
                  </div>
                </div>
              </div>
              <div className="text-[13px]">{u.plan}</div>
              <div>
                <Badge variant={statusVariant[u.status]}>
                  {u.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="text-[13px] font-semibold">{u.mrr}</div>
            </div>
          ))}
        </Card>

        {/* Feature flags */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-[15px] text-sm font-semibold">
            Feature flags
          </div>
          {flags.map((f) => (
            <div
              key={f.key}
              className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
            >
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold">{f.name}</div>
                <div className="mt-px text-[11.5px] text-muted-foreground">
                  {f.desc}
                </div>
              </div>
              <Switch
                checked={f.on}
                onCheckedChange={(on) =>
                  setFlags((prev) =>
                    prev.map((x) => (x.key === f.key ? { ...x, on } : x))
                  )
                }
              />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
