import { NextResponse, type NextRequest } from "next/server";

const adminPaths = ["/admin", "/api/admin"];

function hasSessionCookie(request: NextRequest) {
  const cookies = request.cookies;
  return (
    cookies.has("__Secure-next-auth.session-token") ||
    cookies.has("__Host-next-auth.session-token") ||
    cookies.has("next-auth.session-token")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!adminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/signin";
  url.searchParams.set("callbackUrl", "/admin");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
