import type { ReactNode } from "react";

import AppLayout from "@/components/layout/app-layout";
import ClubSidebar from "@/components/sidebar/club-sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return <AppLayout sidebar={<ClubSidebar />}>{children}</AppLayout>;
}
