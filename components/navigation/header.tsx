"use client";

import { Home } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSections } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "app.sidebar.state";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const visibleSections = useMemo(
    () =>
      getVisibleSections({
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

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Logo" width={32} height={32} />
          <span className="hidden md:block font-semibold">CCTT</span>
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-1">
          {desktopLinks.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
