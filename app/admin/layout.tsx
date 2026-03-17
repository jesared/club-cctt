import type { ReactNode } from "react";

import AppShell from "@/components/navigation/app-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell title="Administration">{children}</AppShell>;
}
