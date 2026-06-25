"use client";

import { useState } from "react";

import { useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const initialPrefs = [
  { key: "weekly", name: "Weekly summary", desc: "A digest of your workspace activity", on: true },
  { key: "product", name: "Product updates", desc: "New features and improvements", on: true },
  { key: "billing", name: "Billing & receipts", desc: "Invoices and payment alerts", on: true },
  { key: "security", name: "Security alerts", desc: "New sign-ins and changes", on: true },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useWorkspace();
  const [prefs, setPrefs] = useState(initialPrefs);

  return (
    <div className="grid grid-cols-[1fr_320px] items-start gap-[18px]">
      {/* Left column */}
      <div className="flex flex-col gap-[18px]">
        {/* Profile */}
        <Card className="p-[22px]">
          <div className="mb-[18px] text-[15px] font-semibold">Profile</div>
          <div className="mb-[22px] flex items-center gap-4">
            <div className="flex size-16 flex-none items-center justify-center rounded-[18px] bg-primary text-2xl font-semibold text-primary-foreground">
              JR
            </div>
            <div>
              <Button variant="secondary" size="sm">
                Upload photo
              </Button>
              <div className="mt-[7px] text-[11.5px] text-faint">
                JPG or PNG, max 2MB
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <FieldLabel>Full name</FieldLabel>
              <Input defaultValue="Jordan Rivera" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input defaultValue="jordan@northwind.co" />
            </div>
            <div className="col-span-2">
              <FieldLabel>Bio</FieldLabel>
              <Textarea
                rows={2}
                defaultValue="Product lead at Northwind Labs. Building tools people love."
              />
            </div>
          </div>
          <div className="mt-[18px] flex justify-end">
            <Button onClick={() => toast("Profile saved")}>Save changes</Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-[22px]">
          <div className="mb-1.5 text-[15px] font-semibold">Notifications</div>
          <div className="mb-4 text-[12.5px] text-muted-foreground">
            Choose what Aura emails you about.
          </div>
          {prefs.map((p) => (
            <div
              key={p.key}
              className="flex items-center gap-3 border-t border-border py-[11px]"
            >
              <div className="flex-1">
                <div className="text-[13.5px] font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              <Switch
                checked={p.on}
                onCheckedChange={(on) =>
                  setPrefs((prev) =>
                    prev.map((x) => (x.key === p.key ? { ...x, on } : x))
                  )
                }
              />
            </div>
          ))}
        </Card>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-[18px]">
        {/* Password */}
        <Card className="p-[22px]">
          <div className="mb-4 text-[15px] font-semibold">Password</div>
          <div className="flex flex-col gap-3">
            <Input type="password" defaultValue="currentpass" />
            <Input type="password" placeholder="New password" />
          </div>
          <Button
            variant="secondary"
            className="mt-3.5 w-full"
            onClick={() => toast("Password updated")}
          >
            Update password
          </Button>
        </Card>

        {/* Danger zone */}
        <Card className="border-bad p-[22px]">
          <div className="mb-1.5 text-[15px] font-semibold text-bad">
            Danger zone
          </div>
          <div className="mb-3.5 text-[12.5px] leading-snug text-muted-foreground">
            Permanently delete your account and all data. This cannot be undone.
          </div>
          <Button variant="destructive" className="w-full">
            Delete account
          </Button>
        </Card>
      </div>
    </div>
  );
}
