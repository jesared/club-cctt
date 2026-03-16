"use client";

import AuthButton from "@/components/AuthButton";
import ClubSidebar from "@/components/ClubSidebar";
import { type SidebarItem } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CalendarClock,
  Handshake,
  Mail,
  Menu,
  ReceiptText,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const clubMenu: SidebarItem[] = [
  {
    label: "Comité",
    href: "/club/comite",
    icon: <Users className="h-4 w-4" />,
    section: "Club",
  },
  {
    label: "Horaires",
    href: "/club/horaires",
    icon: <CalendarClock className="h-4 w-4" />,
    section: "Club",
  },
  {
    label: "Tarifs",
    href: "/club/tarifs",
    icon: <ReceiptText className="h-4 w-4" />,
    section: "Club",
  },
  {
    label: "Contact",
    href: "/club/contact",
    icon: <Mail className="h-4 w-4" />,
    section: "Club",
  },
  {
    label: "Partenaires",
    href: "/club/partenaires",
    icon: <Handshake className="h-4 w-4" />,
    section: "Club",
  },
];

export default function ClubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      <div className="flex min-h-full flex-col">
        <div className="flex flex-1">
          <aside className="hidden w-[240px] flex-col border-r  md:flex">
            <ClubSidebar />
            <div className="mt-auto border-t p-4">
              <AuthButton />
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-4 md:px-8">
            <div className="mb-4 flex items-center justify-between md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Ouvrir la navigation club"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="px-4 py-3 text-left">
                    <SheetTitle>Club</SheetTitle>
                  </SheetHeader>
                  <ClubSidebar />
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
