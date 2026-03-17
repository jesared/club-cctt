"use client";

import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import AppSidebar from "@/components/AppSidebar";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r bg-card">
        {/* SCROLL ZONE */}
        <div className="flex-1 overflow-y-auto">
          <AppSidebar role="user" />
        </div>

        {/* FOOTER SIDEBAR */}
        <div className="border-t p-4">
          <AuthButton />
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* HEADER (SEULEMENT À DROITE) */}
        <header className="flex h-14 items-center border-b px-4 md:px-6">
          {/* MOBILE MENU */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[260px] p-0">
              <SheetHeader className="px-4 py-3">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto">
                  <AppSidebar role="user" />
                </div>

                <div className="border-t p-4">
                  <AuthButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <span className="ml-2 text-sm font-semibold">Dashboard</span>
        </header>

        {/* CONTENT SCROLL */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
