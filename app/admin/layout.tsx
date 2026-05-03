import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AppShell from "@/components/navigation/app-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
