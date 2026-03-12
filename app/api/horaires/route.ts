import { NextResponse } from "next/server";

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
    return NextResponse.json(fallbackHoraires);
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

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallbackHoraires);
  }
}
