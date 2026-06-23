"use client";

import { type ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/lib/workspace";
import { Toaster } from "@/components/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <WorkspaceProvider>
        {children}
        <Toaster />
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
