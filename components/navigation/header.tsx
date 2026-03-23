"use client";

import { Home, ShieldMinus } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSectionsHeader } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

// 🔥 LOGIQUE ACTIVE (IDENTIQUE SIDEBAR)
function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  // 👉 admin global
  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/tournoi"))
    );
  }

  // 👉 admin tournoi (prioritaire)
  if (href === "/admin/tournoi") {
    return pathname.startsWith("/admin/tournoi");
  }

  // 👉 default
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const visibleSections = useMemo(
    () =>
      getVisibleSectionsHeader({
        role: session?.user?.role,
        session: session ?? null,
      }),
    [session],
  );

  const desktopLinks = useMemo(
    () => [
      { href: "/", label: "Accueil", icon: Home },
      ...visibleSections
        .map((section) => section.items[0])
        .filter((item) => item && item.href !== "/")
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
        })),
    ],
    [visibleSections],
  );

  if (pathname !== "/") {
    return null;
  }

  const isAdmin = isAdminRole(session?.user?.role);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6 mx-auto w-full max-w-7xl">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Logo" width={32} height={32} />
          <span className="hidden font-semibold md:block">CCTT</span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="ml-8 hidden items-center gap-1 md:flex">
          {desktopLinks.map((item) => {
            const active = isItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",

                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin/tournoi"
              className="rounded-md border px-3 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <ShieldMinus className="h-4 w-4" />
            </Link>
          )}
          {!session ? (
            <Button size="sm" onClick={() => void signIn("google")}>
              Connexion
            </Button>
          ) : (
            <Link href="/user" className="rounded-md px-3 py-2 text-sm">
              <Image
                src={session.user.image || "/default-avatar.png"}
                alt="Avatar"
                width={40}
                height={40}
                className={cn("rounded-full", "h-8 w-8")}
              />
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
