export const runtime = "nodejs";

import { NextResponse } from "next/server";

const DEFAULT_LOGO_PATH = "http://localhost:3000/partenaires/default-logo.svg";
// en prod Vercel utilisera automatiquement le domaine réel

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  // 🛑 CAS 1 : pas d'id → logo par défaut
  if (!id || id.trim().length === 0) {
    return NextResponse.redirect(DEFAULT_LOGO_PATH);
  }

  try {
    const url = `https://lh3.googleusercontent.com/d/${id}`;

    const res = await fetch(url);

    // 🛑 CAS 2 : Google refuse
    if (!res.ok) {
      return NextResponse.redirect(DEFAULT_LOGO_PATH);
    }

    const contentType = res.headers.get("content-type");

    // 🛑 CAS 3 : Google renvoie HTML
    if (!contentType || !contentType.startsWith("image")) {
      return NextResponse.redirect(DEFAULT_LOGO_PATH);
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.redirect(DEFAULT_LOGO_PATH);
  }
}
