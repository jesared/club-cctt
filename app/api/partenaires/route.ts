export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fileId = process.env.PARTENAIRES_JSON_ID!;
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    const text = await res.text();
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (e) {
    console.log("⚠️ Drive indisponible → fallback local utilisé");

    const local = await import("@/data/partenaires.json");
    return NextResponse.json(local.default);
  }
}
