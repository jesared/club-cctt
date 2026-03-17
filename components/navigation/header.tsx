"use client";

import { Home, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSections } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "app.sidebar.state";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    const updateSidebarState = () => {
      const state = localStorage.getItem(SIDEBAR_KEY);
      setSidebarHidden(state === "hidden");
    };

    updateSidebarState();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === SIDEBAR_KEY) {
        updateSidebarState();
      }
    };

    window.addEventListener("sidebar:update", updateSidebarState);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("sidebar:update", updateSidebarState);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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
        {sidebarHidden && (
          <Button
            variant="secondary"
            size="sm"
            className="mr-3 gap-2"
            aria-label="Rouvrir la sidebar"
            onClick={() => {
              localStorage.setItem(SIDEBAR_KEY, "expanded");
              window.dispatchEvent(new Event("sidebar:update"));
            }}
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Rouvrir le menu</span>
          </Button>
        )}

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
