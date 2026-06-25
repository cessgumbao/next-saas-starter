"use client";

import { useState } from "react";
import { Info, Mail, MoreVertical, Plus } from "lucide-react";

import { avatarColor, cn, initials } from "@/lib/utils";
import { useWorkspace, type Role } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MemberStatus = "Active" | "Invited";
type Member = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  lastActive: string;
};

const initialMembers: Member[] = [
  { id: 1, name: "Jordan Rivera", email: "jordan@northwind.co", role: "Owner", status: "Active", lastActive: "now" },
  { id: 2, name: "Mara Chen", email: "mara@northwind.co", role: "Admin", status: "Active", lastActive: "2h ago" },
  { id: 3, name: "Devin Okafor", email: "devin@northwind.co", role: "Member", status: "Active", lastActive: "5h ago" },
  { id: 4, name: "Priya Nair", email: "priya@northwind.co", role: "Member", status: "Active", lastActive: "yesterday" },
  { id: 5, name: "Leo Marenco", email: "leo@northwind.co", role: "Member", status: "Invited", lastActive: "—" },
  { id: 6, name: "Sasha Idris", email: "sasha@northwind.co", role: "Admin", status: "Active", lastActive: "3d ago" },
];

type Invite = { email: string; role: string; sent: string };
const initialInvites: Invite[] = [
  { email: "tom@acme.io", role: "Member", sent: "2 days ago" },
  { email: "nina@globex.com", role: "Admin", sent: "5 days ago" },
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function TeamPage() {
  const { canManage, toast } = useWorkspace();
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");

  function changeRole(id: number, role: Role) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    toast("Role updated");
  }

  function submitInvite() {
    const email = inviteEmail.trim();
    if (!EMAIL_RE.test(email)) {
      toast("Enter a valid email");
      return;
    }
    setInvites((prev) => [{ email, role: inviteRole, sent: "just now" }, ...prev]);
    setOpen(false);
    setInviteEmail("");
    setInviteRole("Member");
    toast("Invite sent to " + email);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-[18px] flex items-center justify-between">
        <div className="text-[13px] text-muted-foreground">
          <b className="text-foreground">{members.length}</b> members ·{" "}
          <b className="text-foreground">{invites.length}</b> pending invites
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" strokeWidth={2} /> Invite member
          </Button>
        )}
      </div>

      {/* Read-only banner */}
      {!canManage && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-primary-border bg-primary-soft px-[15px] py-3 text-[13px]">
          <Info className="size-4 flex-none text-primary" strokeWidth={2} />
          <span>
            You&apos;re viewing as a <b>Member</b>. Inviting and role changes
            require Admin or Owner.
          </span>
        </div>
      )}

      {/* Members table */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[2.4fr_1.3fr_1fr_1fr_40px] border-b border-border px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-faint">
          <div>Member</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last active</div>
          <div />
        </div>
        {members.map((m, i) => {
          const locked = !canManage || m.role === "Owner";
          return (
            <div
              key={m.id}
              className="grid grid-cols-[2.4fr_1.3fr_1fr_1fr_40px] items-center border-b border-border px-5 py-[13px] last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex size-[34px] flex-none items-center justify-center rounded-[9px] text-[12.5px] font-semibold text-white"
                  style={{ background: avatarColor(i + 1) }}
                >
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-semibold">
                    {m.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {m.email}
                  </div>
                </div>
              </div>
              <div>
                <Select
                  value={m.role}
                  onValueChange={(v) => changeRole(m.id, v as Role)}
                  disabled={locked}
                >
                  <SelectTrigger
                    size="sm"
                    className="border-border bg-surface-2"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Badge variant={m.status === "Active" ? "success" : "warning"}>
                  {m.status}
                </Badge>
              </div>
              <div className="text-[12.5px] text-muted-foreground">
                {m.lastActive}
              </div>
              <div className="text-right text-faint">
                <MoreVertical className="ml-auto size-[18px]" />
              </div>
            </div>
          );
        })}
      </Card>

      {/* Pending invites */}
      <div className="mb-3 mt-6 text-[13px] font-semibold">Pending invites</div>
      <Card className="overflow-hidden p-0">
        {invites.map((inv, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-5 py-[13px] last:border-b-0"
          >
            <div className="flex size-[34px] flex-none items-center justify-center rounded-[9px] border-[1.5px] border-dashed border-border-strong text-faint">
              <Mail className="size-[15px]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium">{inv.email}</div>
              <div className="text-xs text-muted-foreground">
                Invited as {inv.role} · {inv.sent}
              </div>
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
        ))}
      </Card>

      {/* Invite modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-[26px]">
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription className="mb-5 mt-1">
            They&apos;ll get an email invite to join Northwind Labs.
          </DialogDescription>

          <label className="mb-1.5 block text-[12.5px] font-medium text-muted-foreground">
            Email address
          </label>
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="name@company.com"
          />

          <label className="mb-1.5 mt-3.5 block text-[12.5px] font-medium text-muted-foreground">
            Role
          </label>
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-6 flex justify-end gap-2.5">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={submitInvite}>Send invite</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
