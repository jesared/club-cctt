import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, important } = await req.json();

  await prisma.message.update({
    where: { id: params.id },
    data: {
      title,
      content,
      important,
    },
  });

  return NextResponse.json({ ok: true });
}
