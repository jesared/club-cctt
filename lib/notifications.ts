import type {
  Notification,
  NotificationAudience,
  NotificationPriority,
  NotificationSourceKind,
  NotificationType,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";

import { isNotificationSchemaMissingError } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  content: string;
  href?: string | null;
  priority?: NotificationPriority;
  sourceId?: string | null;
  sourceKind?: NotificationSourceKind;
  audience?: NotificationAudience;
  roleScope?: Role | null;
  createdByUserId?: string | null;
  publishedAt?: Date;
  expiresAt?: Date | null;
};

export type MessageNotificationSource = {
  id: string;
  title: string;
  content: string;
  important: boolean;
  status: "DRAFT" | "PUBLISHED";
  authorId: string;
};

type NotificationClient = PrismaClient | Prisma.TransactionClient;

function buildNotificationData(
  input: CreateNotificationInput,
): Prisma.NotificationUncheckedCreateInput {
  return {
    type: input.type,
    title: input.title,
    content: input.content,
    href: input.href ?? null,
    priority: input.priority ?? "NORMAL",
    sourceId: input.sourceId ?? null,
    sourceKind: input.sourceKind ?? "MANUAL",
    audience: input.audience ?? "ALL_MEMBERS",
    roleScope: input.roleScope ?? null,
    createdByUserId: input.createdByUserId ?? null,
    publishedAt: input.publishedAt ?? new Date(),
    expiresAt: input.expiresAt ?? null,
  };
}

export function buildNotificationFromMessage(
  message: MessageNotificationSource,
): CreateNotificationInput {
  return {
    type: "ANNOUNCEMENT",
    title: message.title,
    content: message.content,
    href: "/user/club/annonces",
    priority: message.important ? "HIGH" : "NORMAL",
    sourceId: message.id,
    sourceKind: "MESSAGE",
    audience: "CLUB_SPACE",
    createdByUserId: message.authorId,
  };
}

export async function createNotification(
  input: CreateNotificationInput,
  client: NotificationClient = prisma,
) {
  try {
    return await client.notification.create({
      data: buildNotificationData(input),
    });
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function syncNotificationBySource(
  input: CreateNotificationInput,
  client: NotificationClient = prisma,
): Promise<Notification> {
  if (!input.sourceId) {
    const created = await createNotification(input, client);
    if (!created) {
      return null as never;
    }

    return created;
  }

  try {
    const sourceKind = input.sourceKind ?? "MANUAL";
    const existing = await client.notification.findFirst({
      where: {
        sourceId: input.sourceId,
        sourceKind,
      },
    });

    const data = buildNotificationData(input);

    if (!existing) {
      return await client.notification.create({ data });
    }

    return await client.notification.update({
      where: { id: existing.id },
      data: {
        type: data.type,
        title: data.title,
        content: data.content,
        href: data.href,
        priority: data.priority,
        audience: data.audience,
        roleScope: data.roleScope,
        createdByUserId: data.createdByUserId,
        publishedAt: data.publishedAt,
        expiresAt: data.expiresAt,
      },
    });
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return null as never;
    }

    throw error;
  }
}

export async function deleteNotificationBySource(
  sourceKind: NotificationSourceKind,
  sourceId: string,
  client: NotificationClient = prisma,
) {
  try {
    return await client.notification.deleteMany({
      where: {
        sourceKind,
        sourceId,
      },
    });
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return { count: 0 };
    }

    throw error;
  }
}

export async function syncPublishedMessageNotification(
  message: MessageNotificationSource,
  client: NotificationClient = prisma,
) {
  if (message.status !== "PUBLISHED") {
    await deleteNotificationBySource("MESSAGE", message.id, client);
    return null;
  }

  return syncNotificationBySource(buildNotificationFromMessage(message), client);
}

export function buildVisibleNotificationsWhere(
  role?: Role | null,
): Prisma.NotificationWhereInput {
  const audiences: Prisma.NotificationWhereInput[] = [{ audience: "ALL_MEMBERS" }];

  switch (role) {
    case "CLUB":
      audiences.push(
        { audience: "CLUB_SPACE" },
        { audience: "ROLE", roleScope: "CLUB" },
      );
      break;
    case "BUREAU":
      audiences.push(
        { audience: "CLUB_SPACE" },
        { audience: "BUREAU_SPACE" },
        { audience: "ROLE", roleScope: "BUREAU" },
      );
      break;
    case "ENTRAINEUR":
      audiences.push(
        { audience: "CLUB_SPACE" },
        { audience: "ENTRAINEUR_SPACE" },
        { audience: "ROLE", roleScope: "ENTRAINEUR" },
      );
      break;
    case "ADMIN":
      audiences.push(
        { audience: "CLUB_SPACE" },
        { audience: "BUREAU_SPACE" },
        { audience: "ENTRAINEUR_SPACE" },
        { audience: "ADMIN_ONLY" },
        { audience: "ROLE", roleScope: "ADMIN" },
      );
      break;
    case "USER":
      audiences.push({ audience: "ROLE", roleScope: "USER" });
      break;
    default:
      break;
  }

  return {
    AND: [
      {
        OR: audiences,
      },
      {
        publishedAt: {
          lte: new Date(),
        },
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    ],
  };
}

export function getDefaultNotificationHref(role?: Role | null) {
  void role;
  return "/user/notifications";
}
