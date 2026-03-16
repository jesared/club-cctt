"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import AuthButton from "@/components/AuthButton";
import UserSidebar from "@/components/UserSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      <div className="flex min-h-full flex-col">
        <div className="flex flex-1">
          <aside className="hidden w-[240px] flex-col border-r bg-card md:flex">
            <UserSidebar />
            <div className="mt-auto border-t p-4">
              <AuthButton />
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
            <div className="mb-4 flex items-center justify-between md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Ouvrir la navigation utilisateur">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="border-b px-4 py-3 text-left">
                    <SheetTitle>Espace utilisateur</SheetTitle>
                  </SheetHeader>
                  <UserSidebar />
                  <div className="border-t p-4">
                    <AuthButton />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
