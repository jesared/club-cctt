export const runtime = "nodejs";

import { NextResponse } from "next/server";

function redirectToDefaultLogo(request: Request) {
  return NextResponse.redirect(
    new URL("/partenaires/default-logo.svg", request.url),
  );
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!id || id.trim().length === 0) {
    return redirectToDefaultLogo(req);
  }

  try {
    const url = `https://lh3.googleusercontent.com/d/${id}`;
    const res = await fetch(url);

    if (!res.ok) {
      return redirectToDefaultLogo(req);
    }

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.startsWith("image")) {
      return redirectToDefaultLogo(req);
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return redirectToDefaultLogo(req);
  }
}
