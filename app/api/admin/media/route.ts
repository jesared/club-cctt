import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      uploadedByUser: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    url?: string;
    publicId?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  };

  if (!payload?.url || !payload?.publicId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const item = await prisma.mediaAsset.upsert({
    where: { publicId: payload.publicId },
    update: {
      url: payload.url,
      format: payload.format ?? null,
      bytes: payload.bytes ?? null,
      width: payload.width ?? null,
      height: payload.height ?? null,
    },
    create: {
      url: payload.url,
      publicId: payload.publicId,
      format: payload.format ?? null,
      bytes: payload.bytes ?? null,
      width: payload.width ?? null,
      height: payload.height ?? null,
      uploadedByUserId: session.user.id,
    },
    include: {
      uploadedByUser: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ item });
}
