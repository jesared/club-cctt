import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type BadgeVariant = "jeunes" | "elite" | "loisir" | "libre";

type HorairesData = {
  jours: Array<{
    jour: string;
    seances: Array<{
      type: BadgeVariant[];
      label: string;
      horaire: string;
    }>;
  }>;
};

type HorairesResponse = {
  data: HorairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

const fallbackHoraires: HorairesData = {
  jours: [],
};

function isValidHorairesData(value: unknown): value is HorairesData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<HorairesData>;

  return (
    Array.isArray(data.jours) &&
    data.jours.every(
      (jour) =>
        typeof jour?.jour === "string" &&
        Array.isArray(jour?.seances) &&
        jour.seances.every(
          (seance) =>
            Array.isArray(seance?.type) &&
            seance.type.every((type) =>
              ["jeunes", "elite", "loisir", "libre"].includes(type),
            ) &&
            typeof seance?.label === "string" &&
            typeof seance?.horaire === "string",
        ),
    )
  );
}

export async function GET() {
  const fileId = process.env.HORAIRES_JSON_ID;

  if (!fileId) {
    return NextResponse.json<HorairesResponse>({
      data: fallbackHoraires,
      meta: { stale: true, updatedAt: null },
    });
  }

  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Drive inaccessible");
    }

    const data: unknown = await response.json();

    if (!isValidHorairesData(data)) {
      throw new Error("Format JSON invalide");
    }

    const cached = await prisma.horairesCache.upsert({
      where: { id: "default" },
      update: { data },
      create: { id: "default", data },
    });

    return NextResponse.json<HorairesResponse>({
      data,
      meta: { stale: false, updatedAt: cached.updatedAt.toISOString() },
    });
  } catch {
    try {
      const cached = await prisma.horairesCache.findUnique({
        where: { id: "default" },
      });

      if (cached && isValidHorairesData(cached.data)) {
        return NextResponse.json<HorairesResponse>({
          data: cached.data,
          meta: { stale: true, updatedAt: cached.updatedAt.toISOString() },
        });
      }
    } catch {
      // ignore cache errors and return fallback
    }

    return NextResponse.json<HorairesResponse>({
      data: fallbackHoraires,
      meta: { stale: true, updatedAt: null },
    });
  }
}
