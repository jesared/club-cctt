import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import {
  defaultHorairesContent,
  isValidHorairesData,
  normalizeHorairesContent,
  type HorairesResponse,
} from "@/lib/horaires-content";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

const ADMIN_CONTENT_ID = "admin";
const DRIVE_CACHE_ID = "drive";

export async function GET() {
  const adminContent = await prisma.horairesCache.findUnique({
    where: { id: ADMIN_CONTENT_ID },
  });

  if (adminContent && isValidHorairesData(adminContent.data)) {
    return NextResponse.json<HorairesResponse>({
      data: normalizeHorairesContent(adminContent.data),
      meta: {
        stale: false,
        updatedAt: adminContent.updatedAt.toISOString(),
        source: "admin",
      },
    });
  }

  const fileId = process.env.HORAIRES_JSON_ID;

  if (fileId) {
    try {
      const response = await fetch(
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Drive inaccessible");
      }

      const remoteData: unknown = await response.json();

      if (!isValidHorairesData(remoteData)) {
        throw new Error("Format JSON invalide");
      }

      const data = normalizeHorairesContent(remoteData);
      const cached = await prisma.horairesCache.upsert({
        where: { id: DRIVE_CACHE_ID },
        update: { data },
        create: { id: DRIVE_CACHE_ID, data },
      });

      return NextResponse.json<HorairesResponse>({
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
    const cached = await prisma.horairesCache.findUnique({
      where: { id: DRIVE_CACHE_ID },
    });

    if (cached && isValidHorairesData(cached.data)) {
      return NextResponse.json<HorairesResponse>({
        data: normalizeHorairesContent(cached.data),
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

  return NextResponse.json<HorairesResponse>({
    data: defaultHorairesContent,
    meta: {
      stale: true,
      updatedAt: null,
      source: "fallback",
    },
  });
}

export async function PUT(req: Request) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<HorairesResponse["data"]>;
  const data = normalizeHorairesContent(body);

  const saved = await prisma.horairesCache.upsert({
    where: { id: ADMIN_CONTENT_ID },
    update: { data },
    create: { id: ADMIN_CONTENT_ID, data },
  });

  revalidatePath("/club/horaires");
  revalidatePath("/admin/horaires");

  return NextResponse.json<HorairesResponse>({
    data,
    meta: {
      stale: false,
      updatedAt: saved.updatedAt.toISOString(),
      source: "admin",
    },
  });
}
