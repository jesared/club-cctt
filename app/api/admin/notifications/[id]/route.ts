import { NextResponse } from "next/server";

import { isNotificationSchemaMissingError } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { isAdminRole } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

type NotificationPayload = {
  title?: string;
  content?: string;
  href?: string | null;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  audience?:
    | "ALL_MEMBERS"
    | "CLUB_SPACE"
    | "BUREAU_SPACE"
    | "ENTRAINEUR_SPACE"
    | "ADMIN_ONLY"
    | "ROLE";
  roleScope?: "USER" | "CLUB" | "BUREAU" | "ENTRAINEUR" | "ADMIN" | null;
  republish?: boolean;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as NotificationPayload;

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const content =
    typeof body.content === "string" ? body.content.trim() : undefined;
  const href = typeof body.href === "string" ? body.href.trim() : body.href;
  const priority =
    body.priority && ["LOW", "NORMAL", "HIGH", "URGENT"].includes(body.priority)
      ? body.priority
      : undefined;
  const audience =
    body.audience &&
    [
      "ALL_MEMBERS",
      "CLUB_SPACE",
      "BUREAU_SPACE",
      "ENTRAINEUR_SPACE",
      "ADMIN_ONLY",
      "ROLE",
    ].includes(body.audience)
      ? body.audience
      : undefined;
  const roleScope =
    body.roleScope === null
      ? null
      : body.roleScope &&
          ["USER", "CLUB", "BUREAU", "ENTRAINEUR", "ADMIN"].includes(
            body.roleScope,
          )
        ? body.roleScope
        : undefined;

  try {
    const notification = await withPrismaRetry(() =>
      prisma.notification.update({
        where: { id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(content !== undefined ? { content } : {}),
          ...(href !== undefined ? { href: href || null } : {}),
          ...(priority ? { priority } : {}),
          ...(audience ? { audience } : {}),
          ...(roleScope !== undefined ? { roleScope } : {}),
          ...(body.republish ? { publishedAt: new Date() } : {}),
        },
        include: {
          createdByUser: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              reads: true,
            },
          },
        },
      }),
    );

    return NextResponse.json(notification);
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return NextResponse.json(
        {
          error:
            "La table Notification n'existe pas encore dans la base. Lancez la migration Prisma avant d'utiliser ce module.",
        },
        { status: 503 },
      );
    }

    throw error;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await withPrismaRetry(() =>
      prisma.notification.delete({
        where: { id },
      }),
    );
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return NextResponse.json(
        {
          error:
            "La table Notification n'existe pas encore dans la base. Lancez la migration Prisma avant d'utiliser ce module.",
        },
        { status: 503 },
      );
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
