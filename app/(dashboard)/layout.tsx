import type { ReactNode } from "react";

import AppShell from "@/components/navigation/app-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell title="Châlons-en-Champagne Tennis de Table">{children}</AppShell>
  );
}
