import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

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
    prisma.message.update({
      where: { id },
      data: {
        title: normalizedTitle,
        content: normalizedContent,
        important: Boolean(important),
        status: normalizedStatus,
      },
    }),
  );

  return NextResponse.json(message);
}

