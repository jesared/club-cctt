import { NextResponse } from "next/server";

import {
  isNotificationSchemaMissingError,
  withNotificationSchemaFallback,
} from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { isAdminRole } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

type CreateNotificationPayload = {
  type?: "ANNOUNCEMENT" | "DOCUMENT" | "SCHEDULE" | "TOURNAMENT" | "SYSTEM";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  title?: string;
  content?: string;
  href?: string | null;
  audience?:
    | "ALL_MEMBERS"
    | "CLUB_SPACE"
    | "BUREAU_SPACE"
    | "ENTRAINEUR_SPACE"
    | "ADMIN_ONLY"
    | "ROLE";
  roleScope?: "USER" | "CLUB" | "BUREAU" | "ENTRAINEUR" | "ADMIN" | null;
};

export async function GET() {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await withNotificationSchemaFallback(
    () =>
      withPrismaRetry(() =>
        prisma.notification.findMany({
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
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
          take: 100,
        }),
      ),
    [],
  );

  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CreateNotificationPayload;

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const href = typeof body.href === "string" ? body.href.trim() : body.href;
  const type =
    body.type &&
    ["ANNOUNCEMENT", "DOCUMENT", "SCHEDULE", "TOURNAMENT", "SYSTEM"].includes(
      body.type,
    )
      ? body.type
      : "SYSTEM";
  const priority =
    body.priority && ["LOW", "NORMAL", "HIGH", "URGENT"].includes(body.priority)
      ? body.priority
      : "NORMAL";
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
      : "ALL_MEMBERS";
  const roleScope =
    body.roleScope === null
      ? null
      : body.roleScope &&
          ["USER", "CLUB", "BUREAU", "ENTRAINEUR", "ADMIN"].includes(
            body.roleScope,
          )
        ? body.roleScope
        : null;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Le titre et le contenu sont obligatoires." },
      { status: 400 },
    );
  }

  if (audience === "ROLE" && !roleScope) {
    return NextResponse.json(
      { error: "Un role cible est obligatoire pour cette audience." },
      { status: 400 },
    );
  }

  try {
    const notification = await withPrismaRetry(() =>
      prisma.notification.create({
        data: {
          type,
          priority,
          title,
          content,
          href: href || null,
          sourceKind: "MANUAL",
          audience,
          roleScope: audience === "ROLE" ? roleScope : null,
          createdByUserId: session.user.id,
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

    return NextResponse.json(notification, { status: 201 });
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
