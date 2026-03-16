import type { ReactNode } from "react";

import AppLayout from "@/components/layout/app-layout";
import AdminSidebar from "@/components/sidebar/admin-sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return <AppLayout sidebar={<AdminSidebar />}>{children}</AppLayout>;
}
