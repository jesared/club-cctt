import { NextResponse } from "next/server";

const FILE_ID = process.env.COMITE_JSON_ID!;

export async function GET() {
  try {
    const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("Drive error");

    const data = await res.json();

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Impossible de charger le comité" },
      { status: 500 },
    );
  }
}
