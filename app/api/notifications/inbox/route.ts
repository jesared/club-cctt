import { NextResponse } from "next/server";

import {
  buildVisibleNotificationsWhere,
  getDefaultNotificationHref,
} from "@/lib/notifications";
import { withNotificationSchemaFallback } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const where = buildVisibleNotificationsWhere(session.user.role);

  const notifications = await withNotificationSchemaFallback(
    () =>
      withPrismaRetry(() =>
        prisma.notification.findMany({
          where,
          orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
          take: 6,
          include: {
            createdByUser: {
              select: {
                name: true,
                email: true,
              },
            },
            reads: {
              where: { userId: session.user.id },
              select: { id: true },
              take: 1,
            },
          },
        }),
      ),
    [],
  );

  const unreadCount = await withNotificationSchemaFallback(
    () =>
      withPrismaRetry(() =>
        prisma.notification.count({
          where: {
            AND: [
              where,
              {
                reads: {
                  none: {
                    userId: session.user.id,
                  },
                },
              },
            ],
          },
        }),
      ),
    0,
  );

  return NextResponse.json({
    unreadCount,
    items: notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      important:
        notification.priority === "HIGH" || notification.priority === "URGENT",
      createdAt: notification.publishedAt,
      authorName: notification.createdByUser?.name ?? null,
      authorEmail: notification.createdByUser?.email ?? null,
      isUnread: notification.reads.length === 0,
      href: notification.href ?? getDefaultNotificationHref(session.user.role),
    })),
  });
}
