import { syncPublishedMessageNotification } from "@/lib/notifications";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { isAdminRole } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id, title, content, important, status } = await req.json();
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedContent = typeof content === "string" ? content.trim() : "";
  const normalizedStatus =
    status === "DRAFT" || status === "PUBLISHED" ? status : "PUBLISHED";

  if (!id || !normalizedTitle || !normalizedContent) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const message = await withPrismaRetry(() =>
    prisma.$transaction(async (tx) => {
      const updatedMessage = await tx.message.update({
        where: { id },
        data: {
          title: normalizedTitle,
          content: normalizedContent,
          important: Boolean(important),
          status: normalizedStatus,
        },
      });

      await syncPublishedMessageNotification(updatedMessage, tx);

      return updatedMessage;
    }),
  );

  return NextResponse.json(message);
}

