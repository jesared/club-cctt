import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AppShell from "@/components/navigation/app-shell";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  return <AppShell title="Administration">{children}</AppShell>;
}
