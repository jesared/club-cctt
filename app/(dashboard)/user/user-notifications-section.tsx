"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  isImportant: boolean;
  formattedDate: string;
  authorName: string | null;
  authorEmail: string | null;
  isUnread: boolean;
};

const INITIAL_VISIBLE_NOTIFICATIONS = 3;

export default function UserNotificationsSection({
  notifications,
  canMarkAsRead,
}: {
  notifications: UserNotification[];
  canMarkAsRead: boolean;
}) {
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(
    notifications
      .filter((notification) => !notification.isUnread)
      .map((notification) => notification.id),
  );
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const readNotificationIdSet = useMemo(
    () => new Set(readNotificationIds),
    [readNotificationIds],
  );

  async function markNotificationAsRead(notification: UserNotification) {
    if (
      !canMarkAsRead ||
      readNotificationIdSet.has(notification.id) ||
      pendingReadId === notification.id
    ) {
      return;
    }

    setPendingReadId(notification.id);

    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId: notification.id }),
      });

      if (!response.ok) {
        throw new Error("Unable to mark notification as read.");
      }

      setReadNotificationIds((current) =>
        current.includes(notification.id)
          ? current
          : [...current, notification.id],
      );
    } catch {
      // Keep unread state if the request fails.
    } finally {
      setPendingReadId((current) =>
        current === notification.id ? null : current,
      );
    }
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="font-medium text-foreground">
            Aucune notification récente pour le moment.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les nouvelles annonces, documents et changements apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, INITIAL_VISIBLE_NOTIFICATIONS);
  const hiddenNotificationsCount = Math.max(
    notifications.length - INITIAL_VISIBLE_NOTIFICATIONS,
    0,
  );

  return (
    <div className="grid gap-4">
      {visibleNotifications.map((notification) => {
        const isUnread =
          canMarkAsRead && !readNotificationIdSet.has(notification.id);
        const preview =
          notification.content.length > 220
            ? `${notification.content.slice(0, 220).trimEnd()}...`
            : notification.content;

        return (
          <Card
            key={notification.id}
            className={
              notification.isImportant ? "border-primary/40 bg-primary/5" : undefined
            }
          >
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    {notification.isImportant ? <Badge>Important</Badge> : null}
                    {isUnread ? <Badge variant="secondary">Nouveau</Badge> : null}
                  </div>
                  <CardDescription>
                    {notification.authorName ||
                      notification.authorEmail ||
                      "Club"}{" "}
                    | {notification.formattedDate}
                  </CardDescription>
                </div>

                <Button asChild type="button" size="sm" variant="outline">
                  <Link
                    href={notification.href}
                    onClick={() => void markNotificationAsRead(notification)}
                  >
                    Lire la notification
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {preview}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isUnread ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pendingReadId === notification.id}
                    onClick={() => void markNotificationAsRead(notification)}
                  >
                    {pendingReadId === notification.id
                      ? "Mise à jour..."
                      : "Marquer comme lu"}
                  </Button>
                ) : (
                  <Badge variant="outline">Lu</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {hiddenNotificationsCount > 0 ? (
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setShowAllNotifications((current) => !current)
            }
          >
            {showAllNotifications
              ? "Afficher moins de notifications"
              : `Afficher ${hiddenNotificationsCount} notification${
                  hiddenNotificationsCount > 1 ? "s" : ""
                } de plus`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
