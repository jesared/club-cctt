"use client";

import type { ReactNode } from "react";
import { CalendarClock, Handshake, Mail, ReceiptText, Users } from "lucide-react";
import { useState } from "react";

import Sidebar, { SidebarCollapseButton, type SidebarItem } from "@/components/layout/sidebar";

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
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Club</h1>
        <SidebarCollapseButton collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      </div>
      <div className="flex gap-6" data-collapsed={collapsed}>
        <Sidebar items={clubMenu} title="Menu club" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
