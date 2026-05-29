import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as { name?: string };
  const nextName = payload.name?.trim();

  if (!nextName) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: nextName },
  });

  return NextResponse.json({ ok: true });
}
