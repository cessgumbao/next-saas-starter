"use client";

import * as React from "react";

export type Role = "Owner" | "Admin" | "Member";

type Toast = { id: number; msg: string };

type WorkspaceContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  canManage: boolean;
  isAdminAllowed: boolean;
  toast: (msg: string) => void;
  toasts: Toast[];
};

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("Owner");
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const toast = React.useCallback((msg: string) => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = React.useMemo<WorkspaceContextValue>(
    () => ({
      role,
      setRole,
      canManage: role === "Owner" || role === "Admin",
      isAdminAllowed: role === "Owner",
      toast,
      toasts,
    }),
    [role, toast, toasts]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
