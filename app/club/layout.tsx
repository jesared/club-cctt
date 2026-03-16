"use client";

import type { ReactNode } from "react";
import { CalendarClock, Handshake, Mail, ReceiptText, Users } from "lucide-react";
import { useState } from "react";

import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";

const clubMenu: SidebarItem[] = [
  { label: "Comité", href: "/club/comite", icon: <Users className="h-4 w-4" /> },
  { label: "Horaires", href: "/club/horaires", icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Tarifs", href: "/club/tarifs", icon: <ReceiptText className="h-4 w-4" /> },
  { label: "Contact", href: "/club/contact", icon: <Mail className="h-4 w-4" /> },
  { label: "Partenaires", href: "/club/partenaires", icon: <Handshake className="h-4 w-4" /> },
];

export default function ClubLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Club</h1>
        <p className="text-muted-foreground">Informations et ressources du club.</p>
      </header>

      <div className="flex min-w-0 gap-6">
        <Sidebar
          items={clubMenu}
          title="Menu club"
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
