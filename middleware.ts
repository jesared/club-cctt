import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  if (isAdminRoute) {
    const token = await getToken({ req: request });
    const role =
      typeof token?.role === "string" ? token.role.toLowerCase() : null;

    if (role && role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/user";
      url.searchParams.set("forbidden", "admin");
      return NextResponse.redirect(url);
    }
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
