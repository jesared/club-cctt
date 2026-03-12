import { NextResponse } from "next/server";

type ComiteData = {
  bureau: Array<{
    poste: string;
    nom: string;
    description: string;
    photo: string;
  }>;
  membres: Array<{
    nom: string;
  }>;
  salaries: Array<{
    nom: string;
  }>;
};

const fallbackComite: ComiteData = {
  bureau: [],
  membres: [],
  salaries: [],
};

function isValidComiteData(value: unknown): value is ComiteData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<ComiteData>;

  return (
    Array.isArray(data.bureau) &&
    data.bureau.every(
      (membre) =>
        typeof membre?.poste === "string" &&
        typeof membre?.nom === "string" &&
        typeof membre?.description === "string" &&
        typeof membre?.photo === "string",
    ) &&
    Array.isArray(data.membres) &&
    data.membres.every((membre) => typeof membre?.nom === "string") &&
    Array.isArray(data.salaries) &&
    data.salaries.every((salarie) => typeof salarie?.nom === "string")
  );
}

export async function GET() {
  const fileId = process.env.COMITE_JSON_ID;

  if (!fileId) {
    return NextResponse.json(fallbackComite);
  }

  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("Drive inaccessible");

    const data: unknown = await res.json();

    if (!isValidComiteData(data)) {
      throw new Error("Format JSON invalide");
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallbackComite);
  }
}
