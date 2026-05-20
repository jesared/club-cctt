import {
  defaultComiteContent,
  isValidComiteData,
  normalizeComiteContent,
  type ComiteResponse,
} from "@/lib/comite-content";
import { prisma } from "@/lib/prisma";

const ADMIN_CONTENT_ID = "admin";
const DRIVE_CACHE_ID = "drive";

export async function getComiteResponse(): Promise<ComiteResponse> {
  const adminContent = await prisma.comiteCache.findUnique({
    where: { id: ADMIN_CONTENT_ID },
  });

  if (adminContent && isValidComiteData(adminContent.data)) {
    return {
      data: normalizeComiteContent(adminContent.data),
      meta: {
        stale: false,
        updatedAt: adminContent.updatedAt.toISOString(),
        source: "admin",
      },
    };
  }

  const fileId = process.env.COMITE_JSON_ID;

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

      if (!isValidComiteData(remoteData)) {
        throw new Error("Format JSON invalide");
      }

      const data = normalizeComiteContent(remoteData);
      const cached = await prisma.comiteCache.upsert({
        where: { id: DRIVE_CACHE_ID },
        update: { data },
        create: { id: DRIVE_CACHE_ID, data },
      });

      return {
        data,
        meta: {
          stale: false,
          updatedAt: cached.updatedAt.toISOString(),
          source: "drive",
        },
      };
    } catch {
      // fallback on cached drive data below
    }
  }

  try {
    const cached = await prisma.comiteCache.findUnique({
      where: { id: DRIVE_CACHE_ID },
    });

    if (cached && isValidComiteData(cached.data)) {
      return {
        data: normalizeComiteContent(cached.data),
        meta: {
          stale: true,
          updatedAt: cached.updatedAt.toISOString(),
          source: "drive",
        },
      };
    }
  } catch {
    // ignore cache errors and return fallback
  }

  return {
    data: defaultComiteContent,
    meta: {
      stale: true,
      updatedAt: null,
      source: "fallback",
    },
  };
}
