import { auth } from "@/auth";
import { fetchFFTTPlayerByLicence } from "@/lib/fftt";
import { NextRequest, NextResponse } from "next/server";

function sanitizeLicence(raw: string | null) {
  if (!raw) {
    return "";
  }

  return raw.replace(/\s/g, "").trim();
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const licence = sanitizeLicence(request.nextUrl.searchParams.get("licence"));

  if (!/^\d{7,12}[A-Z]?$/.test(licence)) {
    return NextResponse.json(
      {
        message:
          "Numéro de licence invalide. Format attendu: 7 à 12 chiffres, éventuellement suivi d'une lettre.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await fetchFFTTPlayerByLicence(licence);

    if (!result.ok) {
      return NextResponse.json(
        {
          message: result.error,
          details: result.payload,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({ player: result.player }, { status: 200 });
  } catch (error) {
    console.error("FFTT Smartping lookup error", error);

    return NextResponse.json(
      {
        message:
          "Le service FFTT Smartping n'est pas configuré correctement. Vérifiez les variables d'environnement FFTT_API_SERIE, FFTT_API_ID et FFTT_API_PASSWORD.",
      },
      { status: 503 }
    );
  }
}
