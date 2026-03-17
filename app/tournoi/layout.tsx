"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";

import AuthButton from "@/components/AuthButton";
import TournoiSidebar from "@/components/TournoiSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR DESKTOP FIXE */}
      <aside className="hidden md:flex md:w-[260px] md:flex-col md:border-r md:bg-card md:h-screen md:sticky md:top-0">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <TournoiSidebar />
        </div>

        <div className="border-t p-4">
          <AuthButton />
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* HEADER MOBILE */}
        <div className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Ouvrir la navigation utilisateur"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[260px] p-0">
              <SheetHeader className="px-4 py-3 text-left">
                <SheetTitle>Espace tournoi</SheetTitle>
              </SheetHeader>

              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto">
                  <TournoiSidebar />
                </div>

                <div className="border-t p-4">
                  <AuthButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
