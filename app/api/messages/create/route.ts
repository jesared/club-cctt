import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { isAdminRole } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session || !session.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { title, content, important, status } = await req.json();
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedContent = typeof content === "string" ? content.trim() : "";
  const normalizedStatus =
    status === "DRAFT" || status === "PUBLISHED" ? status : "PUBLISHED";

  if (!normalizedTitle || !normalizedContent) {
    return NextResponse.json(
      { error: "Titre et contenu obligatoires" },
      { status: 400 },
    );
  }

  await withPrismaRetry(() =>
    prisma.message.create({
      data: {
        title: normalizedTitle,
        content: normalizedContent,
        important: Boolean(important),
        status: normalizedStatus,
        authorId: session.user.id,
      },
    }),
  );

  return NextResponse.json({ ok: true });
}
