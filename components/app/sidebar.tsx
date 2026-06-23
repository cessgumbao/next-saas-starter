"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { primaryNav, settingsNav, type NavItem } from "@/lib/nav";
import { useWorkspace } from "@/lib/workspace";
import { LogoMark } from "@/components/app/logo";

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const { isAdminAllowed } = useWorkspace();
  const active = pathname === item.href;
  const Icon = item.icon;
  const locked = item.ownerOnly && !isAdminAllowed;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex w-full items-center gap-[11px] rounded-[10px] px-[11px] py-[9px] text-[13.5px] transition-colors",
        active
          ? "bg-primary-soft font-bold text-primary"
          : "font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      )}
    >
      <Icon className="size-[18px]" strokeWidth={1.8} />
      <span className="flex-1 text-left">{item.label}</span>
      {locked && <Lock className="size-[13px] opacity-50" strokeWidth={2} />}
    </Link>
  );
}

export function Sidebar() {
  const { role, toast } = useWorkspace();

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] flex-none flex-col gap-1 border-r border-border bg-surface px-[14px] py-[18px]">
      {/* Brand */}
      <div className="flex items-center gap-[11px] px-2 pb-[14px] pt-1.5">
        <LogoMark className="size-[34px]" ringClassName="size-[13px]" />
        <div className="flex-1">
          <div className="text-base font-bold tracking-[-0.02em]">Aura</div>
        </div>
        <div className="font-mono text-[10px] font-semibold text-faint">
          v2.4
        </div>
      </div>

      {/* Primary nav */}
      {primaryNav.map((item) => (
        <NavLink key={item.href} item={item} />
      ))}

      <div className="flex-1" />

      {/* Upgrade card */}
      <div className="mx-1 mb-2.5 mt-2 rounded-2xl border border-primary-border bg-primary-soft p-3.5">
        <div className="mb-0.5 text-[13px] font-semibold text-foreground">
          Upgrade to Business
        </div>
        <div className="mb-2.5 text-xs leading-relaxed text-muted-foreground">
          Unlimited seats, SSO &amp; priority support.
        </div>
        <Link
          href="/billing"
          className="block w-full rounded-[9px] bg-primary py-2 text-center text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-press"
        >
          View plans
        </Link>
      </div>

      {/* Settings */}
      <NavLink item={settingsNav} />

      {/* User card */}
      <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-surface-2 p-[9px]">
        <div className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-primary text-[13px] font-semibold text-primary-foreground">
          JR
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">
            Jordan Rivera
          </div>
          <div className="text-[11px] text-muted-foreground">{role}</div>
        </div>
        <button
          type="button"
          title="Sign out"
          onClick={() => toast("Signed out successfully")}
          className="flex cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-[17px]" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
