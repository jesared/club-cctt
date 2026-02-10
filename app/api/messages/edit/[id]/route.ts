import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;

  const body = await req.json();
  const { title, content, important } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  await prisma.message.update({
    where: { id },
    data: {
      title,
      content,
      important: Boolean(important),
    },
  });

  return NextResponse.json({ ok: true });
}
