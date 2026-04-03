import { NextResponse, type NextRequest } from "next/server";

const adminPaths = ["/admin", "/api/admin"];
const authPaths = ["/user", "/tournoi/inscription", "/api/user"];

function hasSessionCookie(request: NextRequest) {
  const cookies = request.cookies;
  return (
    cookies.has("__Secure-next-auth.session-token") ||
    cookies.has("__Host-next-auth.session-token") ||
    cookies.has("next-auth.session-token")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

  if (!isAdminRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const hasCookie = hasSessionCookie(request);

  if (!hasCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set(
      "callbackUrl",
      isAdminRoute ? "/admin" : pathname,
    );
    if (!isAdminRoute) {
      url.searchParams.set("reason", "auth");
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/user/:path*",
    "/tournoi/inscription",
    "/api/user/:path*",
  ],
};
