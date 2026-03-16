import type { ReactNode } from "react";

import AppLayout from "@/components/layout/app-layout";
import UserSidebar from "@/components/sidebar/user-sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return <AppLayout sidebar={<UserSidebar />}>{children}</AppLayout>;
}
