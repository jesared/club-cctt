import { BellRing, Megaphone } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildVisibleNotificationsWhere,
  getDefaultNotificationHref,
} from "@/lib/notifications";
import { withNotificationSchemaFallback } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import NotificationsList from "./notifications-list";

function formatNotificationDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function UserNotificationsPage() {
  const session = await getCurrentSession();
  const role = session?.user?.role ?? null;
  const where = buildVisibleNotificationsWhere(role);

  const notifications = await withNotificationSchemaFallback(
    () =>
      prisma.notification.findMany({
        where,
        orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
        take: 50,
        include: {
          createdByUser: {
            select: {
              name: true,
              email: true,
            },
          },
          reads: {
            where: {
              userId: session?.user?.id ?? "",
            },
            select: {
              id: true,
            },
            take: 1,
          },
        },
      }),
    [],
  );

  const unreadCount = notifications.filter(
    (notification) => notification.reads.length === 0,
  ).length;
  const importantCount = notifications.filter((notification) =>
    ["HIGH", "URGENT"].includes(notification.priority),
  ).length;
  const documentCount = notifications.filter(
    (notification) => notification.type === "DOCUMENT",
  ).length;

  const formattedNotifications = notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    content: notification.content,
    href: notification.href ?? getDefaultNotificationHref(role),
    isUnread: notification.reads.length === 0,
    isImportant:
      notification.priority === "HIGH" || notification.priority === "URGENT",
    formattedDate: formatNotificationDate(notification.publishedAt),
    authorName: notification.createdByUser?.name ?? null,
    authorEmail: notification.createdByUser?.email ?? null,
  }));

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace membre
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Retrouvez ici l&apos;historique des annonces, changements de
            planning et mises a jour documentaires publies pour votre espace.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Non lues
            </p>
            <p className="text-3xl font-semibold">{unreadCount}</p>
            <p className="text-xs text-muted-foreground">
              Notifications restant a consulter.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Importantes
            </p>
            <p className="text-3xl font-semibold">{importantCount}</p>
            <p className="text-xs text-muted-foreground">
              Alertes mises en avant dans votre flux.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Documents
            </p>
            <p className="text-3xl font-semibold">{documentCount}</p>
            <p className="text-xs text-muted-foreground">
              Publications documentaires detectees automatiquement.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Historique charge
            </p>
            <p className="text-3xl font-semibold">
              {formattedNotifications.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Notifications recentes disponibles dans le centre.
            </p>
          </CardContent>
        </Card>
      </section>

      <NotificationsList initialNotifications={formattedNotifications} />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              Canal unifie
            </CardTitle>
            <CardDescription>
              Le flux regroupe annonces, planning et documents sans passer par
              plusieurs ecrans.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Annonces
            </CardTitle>
            <CardDescription>
              Les publications admin importantes remontent automatiquement ici.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
