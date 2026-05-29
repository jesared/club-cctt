"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { NavigationBadges } from "@/components/navigation/menu-items";
import SiteBreadcrumb from "../SiteBreadcrumb";
import Sidebar from "./Sidebar";
import { isPublicRoute } from "@/lib/routes";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  sidebarBadges?: NavigationBadges;
};

export default function AppShell({
  children,
  title,
  sidebarBadges,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block">
        <Sidebar badges={sidebarBadges} />
      </div>

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* MOBILE MENU */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Ouvrir le menu"
                className="fixed left-4 top-4 z-50 border border-border bg-background/95 shadow-lg backdrop-blur dark:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[320px] max-w-[88vw] p-0">
              <Sidebar
                mobile
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                badges={sidebarBadges}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* HEADER DESKTOP */}
        <header className="hidden h-14 items-center border-b bg-background/90 px-6 backdrop-blur md:flex">
          {title ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{title}</div>
            </div>
          ) : null}

          <div className="ml-auto">
            <SiteBreadcrumb />
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-16 md:px-8 md:py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
