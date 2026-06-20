"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UserNotification = {
  id: string;
  title: string;
  content: string;
  href: string;
  isUnread: boolean;
  isImportant: boolean;
  formattedDate: string;
  authorName: string | null;
  authorEmail: string | null;
};

type NotificationFilter = "ALL" | "UNREAD";

export default function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: UserNotification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pendingReadIds, setPendingReadIds] = useState<string[]>([]);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");

  const unreadCount = notifications.filter((item) => item.isUnread).length;

  const visibleNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((item) => item.isUnread);
    }

    return notifications;
  }, [filter, notifications]);

  async function markNotificationAsRead(notificationId: string) {
    const target = notifications.find((item) => item.id === notificationId);

    if (!target?.isUnread || pendingReadIds.includes(notificationId)) {
      return true;
    }

    setPendingReadIds((current) => [...current, notificationId]);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isUnread: false } : item,
      ),
    );

    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error("Unable to mark notification as read.");
      }

      return true;
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, isUnread: true } : item,
        ),
      );
      return false;
    } finally {
      setPendingReadIds((current) =>
        current.filter((id) => id !== notificationId),
      );
    }
  }

  async function markAllNotificationsAsRead() {
    const unreadIds = notifications
      .filter((item) => item.isUnread)
      .map((item) => item.id);

    if (unreadIds.length === 0 || isMarkingAllRead) {
      return;
    }

    setIsMarkingAllRead(true);
    setPendingReadIds((current) => [...new Set([...current, ...unreadIds])]);
    setNotifications((current) =>
      current.map((item) => ({ ...item, isUnread: false })),
    );

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to mark all notifications as read.");
      }
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          unreadIds.includes(item.id) ? { ...item, isUnread: true } : item,
        ),
      );
    } finally {
      setPendingReadIds((current) =>
        current.filter((id) => !unreadIds.includes(id)),
      );
      setIsMarkingAllRead(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="font-medium text-foreground">
            Aucune notification pour le moment.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les nouvelles annonces, documents et changements importants
            apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={filter === "ALL" ? "default" : "outline"}
              onClick={() => setFilter("ALL")}
            >
              Toutes
            </Button>
            <Button
              type="button"
              size="sm"
              variant={filter === "UNREAD" ? "default" : "outline"}
              onClick={() => setFilter("UNREAD")}
            >
              Non lues
            </Button>
            <Badge variant="secondary">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</Badge>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={unreadCount === 0 || isMarkingAllRead}
            onClick={() => void markAllNotificationsAsRead()}
          >
            {isMarkingAllRead ? "Mise a jour..." : "Tout marquer comme lu"}
          </Button>
        </CardContent>
      </Card>

      {visibleNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="font-medium text-foreground">
              Plus aucune notification non lue.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vous etes a jour sur le flux du club.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={
            notification.isImportant
              ? "border-primary/40 bg-primary/5"
              : notification.isUnread
                ? "border-border/90 bg-card/95"
                : undefined
          }
        >
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg">{notification.title}</CardTitle>
                  {notification.isImportant ? <Badge>Important</Badge> : null}
                  {notification.isUnread ? (
                    <Badge variant="secondary">Nouveau</Badge>
                  ) : (
                    <Badge variant="outline">Lu</Badge>
                  )}
                </div>
                <CardDescription>
                  {notification.authorName ||
                    notification.authorEmail ||
                    "Club"}{" "}
                  | {notification.formattedDate}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {notification.content}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {notification.isUnread ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pendingReadIds.includes(notification.id)}
                  onClick={() => void markNotificationAsRead(notification.id)}
                >
                  {pendingReadIds.includes(notification.id)
                    ? "Mise a jour..."
                    : "Marquer comme lu"}
                </Button>
              ) : null}

              <Button asChild type="button" size="sm" variant="outline">
                <Link
                  href={notification.href}
                  onClick={() => void markNotificationAsRead(notification.id)}
                >
                  Lire la notification
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
