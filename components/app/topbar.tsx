"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { notifications, pageMeta } from "@/lib/nav";
import { useWorkspace, type Role } from "@/lib/workspace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      title="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-[38px] flex-none cursor-pointer items-center justify-center rounded-[10px] border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      {isDark ? (
        <Sun className="size-[18px]" strokeWidth={1.8} />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.8} />
      )}
    </button>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { role, setRole } = useWorkspace();
  const meta = pageMeta[pathname] ?? pageMeta["/dashboard"];

  return (
    <header className="sticky top-0 z-20 flex h-[66px] flex-none items-center gap-3.5 border-b border-border bg-surface px-[26px]">
      <div className="min-w-0">
        <div className="text-[17px] font-bold leading-[1.2] tracking-[-0.02em]">
          {meta.title}
        </div>
        <div className="text-[12.5px] text-muted-foreground">{meta.sub}</div>
      </div>

      <div className="flex-1" />

      {/* Search (decorative) */}
      <div className="flex w-[210px] items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-[11px] py-[7px] text-faint">
        <Search className="size-[15px]" strokeWidth={2} />
        <input
          placeholder="Search…"
          className="w-full border-none bg-transparent text-[13px] text-foreground outline-none"
        />
      </div>

      {/* View as role switcher */}
      <div className="flex items-center gap-2 rounded-[10px] border border-border bg-surface-2 py-[5px] pl-[11px] pr-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          View as
        </span>
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger size="sm" className="border-input bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Owner">Owner</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ThemeToggle />

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Notifications"
            className="relative flex size-[38px] flex-none cursor-pointer items-center justify-center rounded-[10px] border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Bell className="size-[18px]" strokeWidth={1.8} />
            <span className="absolute right-2 top-[7px] size-[7px] rounded-full border-2 border-surface bg-primary" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[330px]">
          <div className="flex items-center justify-between border-b border-border px-4 py-[13px]">
            <span className="text-sm font-semibold">Notifications</span>
            <span className="cursor-pointer text-[11px] font-semibold text-primary">
              Mark all read
            </span>
          </div>
          {notifications.map((n, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-[11px] px-4 py-3",
                i < notifications.length - 1 && "border-b border-border"
              )}
            >
              <div className="mt-[5px] size-2 flex-none rounded-full bg-primary opacity-85" />
              <div className="flex-1">
                <div className="text-[13px] leading-[1.45] text-foreground">
                  {n.text}
                </div>
                <div className="mt-0.5 text-[11.5px] text-faint">{n.time}</div>
              </div>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
