import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import {
  defaultTarifsContent,
  isValidTarifsData,
  normalizeTarifsContent,
  type TarifsResponse,
} from "@/lib/tarifs-content";

const ADMIN_CONTENT_ID = "admin";
const DRIVE_CACHE_ID = "drive";

export async function GET() {
  const adminContent = await prisma.tarifsCache.findUnique({
    where: { id: ADMIN_CONTENT_ID },
  });

  if (adminContent && isValidTarifsData(adminContent.data)) {
    return NextResponse.json<TarifsResponse>({
      data: normalizeTarifsContent(adminContent.data),
      meta: {
        stale: false,
        updatedAt: adminContent.updatedAt.toISOString(),
        source: "admin",
      },
    });
  }

  const fileId = process.env.TARIFS_JSON_ID;

  if (fileId) {
    try {
      const res = await fetch(
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        throw new Error("Drive inaccessible");
      }

      const remoteData: unknown = await res.json();

      if (!isValidTarifsData(remoteData)) {
        throw new Error("Format JSON invalide");
      }

      const data = normalizeTarifsContent(remoteData);
      const cached = await prisma.tarifsCache.upsert({
        where: { id: DRIVE_CACHE_ID },
        update: { data },
        create: { id: DRIVE_CACHE_ID, data },
      });

      return NextResponse.json<TarifsResponse>({
        data,
        meta: {
          stale: false,
          updatedAt: cached.updatedAt.toISOString(),
          source: "drive",
        },
      });
    } catch {
      // fallback on cached drive data below
    }
  }

  try {
    const cached = await prisma.tarifsCache.findUnique({
      where: { id: DRIVE_CACHE_ID },
    });

    if (cached && isValidTarifsData(cached.data)) {
      return NextResponse.json<TarifsResponse>({
        data: normalizeTarifsContent(cached.data),
        meta: {
          stale: true,
          updatedAt: cached.updatedAt.toISOString(),
          source: "drive",
        },
      });
    }
  } catch {
    // ignore cache errors and return fallback
  }

  return NextResponse.json<TarifsResponse>({
    data: defaultTarifsContent,
    meta: {
      stale: true,
      updatedAt: null,
      source: "fallback",
    },
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<TarifsResponse["data"]>;
  const data = normalizeTarifsContent(body);

  const saved = await prisma.tarifsCache.upsert({
    where: { id: ADMIN_CONTENT_ID },
    update: { data },
    create: { id: ADMIN_CONTENT_ID, data },
  });

  revalidatePath("/club/tarifs");
  revalidatePath("/admin/tarifs");

  return NextResponse.json<TarifsResponse>({
    data,
    meta: {
      stale: false,
      updatedAt: saved.updatedAt.toISOString(),
      source: "admin",
    },
  });
}
