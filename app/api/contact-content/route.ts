import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  defaultContactContent,
  normalizeContactContent,
} from "@/lib/contact-content";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET() {
  const existing = await prisma.contactContent.findUnique({
    where: { id: "default" },
  });

  const data = normalizeContactContent(existing ?? undefined);

  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<typeof defaultContactContent>;
  const data = normalizeContactContent(body);

  const saved = await prisma.contactContent.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  return NextResponse.json({ data: saved });
}
