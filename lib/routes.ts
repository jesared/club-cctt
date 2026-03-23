export function isPublicRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
    return false;
  }

  if (pathname === "/") {
    return true;
  }

  if (pathname.startsWith("/club") || pathname.startsWith("/tournoi")) {
    return true;
  }

  const publicRoots = [
    "/actualites",
    "/competitions",
    "/espace",
    "/evenements",
    "/home",
    "/inscriptions",
    "/reglement",
    "/theme",
    "/tournoihome",
  ];

  return publicRoots.some((root) => pathname.startsWith(root));
}
