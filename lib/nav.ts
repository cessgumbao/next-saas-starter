import {
  CreditCard,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Gated to Owners — shows a lock when the current role can't access it. */
  ownerOnly?: boolean;
};

/** Primary navigation (top of the sidebar). */
export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Team", href: "/team", icon: Users },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Admin", href: "/admin", icon: Shield, ownerOnly: true },
];

/** Settings sits on its own near the bottom of the sidebar. */
export const settingsNav: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};

/** Topbar title + subtitle per route. */
export const pageMeta: Record<string, { title: string; sub: string }> = {
  "/dashboard": {
    title: "Dashboard",
    sub: "Welcome back, Jordan — here's your workspace today.",
  },
  "/team": { title: "Team", sub: "Manage members, roles and invitations." },
  "/billing": {
    title: "Billing",
    sub: "Manage your subscription, plan and invoices.",
  },
  "/emails": {
    title: "Email notifications",
    sub: "Transactional templates sent by Aura.",
  },
  "/admin": {
    title: "Admin",
    sub: "Platform-wide controls and user management.",
  },
  "/settings": {
    title: "Settings",
    sub: "Manage your profile, security and preferences.",
  },
};

export const notifications = [
  { text: "Skyline Co just upgraded to Business", time: "12 min ago" },
  { text: "Payment of $49.00 received from Mara Chen", time: "1 hour ago" },
  { text: "Globex Inc payment failed — card declined", time: "3 hours ago" },
];
