"use client";

import type { ReactNode } from "react";

import Sidebar from "@/components/navigation/Sidebar";

type AppShellProps = {
  children: ReactNode;
  title: string;
};

export default function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="fixed inset-0 z-40 flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-14 shrink-0 items-center border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Sidebar mobile />
          </div>
          <div className="text-sm font-semibold">{title}</div>
        </header>

        <main className="app-scroll flex-1 overflow-y-auto px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
