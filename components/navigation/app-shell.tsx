"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";

import Sidebar from "@/components/navigation/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SiteBreadcrumb from "../SiteBreadcrumb";

type AppShellProps = {
  children: ReactNode;
  title: string;
};

export default function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <header className="flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur md:px-6">
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

          <div className="ml-2 text-sm font-semibold">{title}</div>
          <SiteBreadcrumb />
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
