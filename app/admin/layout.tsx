import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AppShell from "@/components/navigation/app-shell";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/user?forbidden=admin");
  }

  const messageCount = await prisma.message.count();

  return (
    <AppShell
      title="Administration"
      sidebarBadges={{
        "/admin/messages": messageCount > 0 ? String(messageCount) : undefined,
      }}
    >
      {children}
    </AppShell>
  );
}
