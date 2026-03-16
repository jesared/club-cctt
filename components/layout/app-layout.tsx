"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AppLayout({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="border-b px-4 py-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ouvrir la navigation latérale">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r bg-card md:flex">{sidebar}</aside>

        <main className="min-w-0 flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
