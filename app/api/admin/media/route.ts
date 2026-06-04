import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { buildDocumentNotification, syncNotificationBySource } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET() {
  const session = await getCurrentSession();

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
  const session = await getCurrentSession();

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

  const mediaUrl = payload.url;
  const mediaPublicId = payload.publicId;

  const existing = await prisma.mediaAsset.findUnique({
    where: { publicId: mediaPublicId },
    select: {
      id: true,
    },
  });

  const item = await prisma.$transaction(async (tx) => {
    const savedItem = await tx.mediaAsset.upsert({
      where: { publicId: mediaPublicId },
      update: {
        url: mediaUrl,
        format: payload.format ?? null,
        bytes: payload.bytes ?? null,
        width: payload.width ?? null,
        height: payload.height ?? null,
      },
      create: {
        url: mediaUrl,
        publicId: mediaPublicId,
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

    const assetLabel = mediaPublicId.split("/").pop() ?? "document";

    await syncNotificationBySource(
      buildDocumentNotification({
        title: existing
          ? "Document mis a jour"
          : "Nouveau document disponible",
        content: existing
          ? `Le document ${assetLabel} a été mis a jour dans la bibliotheque du club.`
          : `Le document ${assetLabel} vient d'être ajoute dans la bibliotheque du club.`,
        href: "/user/club/documents",
        sourceId: mediaPublicId,
        createdByUserId: session.user.id,
      }),
      tx,
    );

    return savedItem;
  });

  return NextResponse.json({ item });
}
