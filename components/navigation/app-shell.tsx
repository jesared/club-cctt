"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SiteBreadcrumb from "../SiteBreadcrumb";
import Sidebar from "./Sidebar";
import { isPublicRoute } from "@/lib/routes";

type AppShellProps = {
  children: ReactNode;
  title: string;
};

export default function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <header className="flex h-14 items-center border-b bg-background/90 px-4 backdrop-blur md:px-6">
          {/* MOBILE MENU */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[260px] p-0">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-2">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground md:hidden">
              Tableau de bord
            </div>
          </div>
          <div className="ml-auto">
            <SiteBreadcrumb />
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
