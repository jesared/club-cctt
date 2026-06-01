import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AppShell from "@/components/navigation/app-shell";
import { withNotificationSchemaFallback } from "@/lib/notification-safety";
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

  const [messageCount, notificationCount] = await Promise.all([
    prisma.message.count(),
    withNotificationSchemaFallback(() => prisma.notification.count(), 0),
  ]);

  return (
    <AppShell
      title="Administration"
      sidebarBadges={{
        "/admin/notifications":
          notificationCount > 0 ? String(notificationCount) : undefined,
        "/admin/messages": messageCount > 0 ? String(messageCount) : undefined,
      }}
    >
      {children}
    </AppShell>
  );
}
