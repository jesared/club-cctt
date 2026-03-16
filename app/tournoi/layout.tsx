"use client";

import type { ReactNode } from "react";
import { ClipboardList, List, Medal, Trophy, UserPlus } from "lucide-react";
import { useState } from "react";

import Sidebar, { SidebarCollapseButton, type SidebarItem } from "@/components/layout/sidebar";

const tournoiMenu: SidebarItem[] = [
  { label: "Tournoi", href: "/tournoi", icon: <Trophy className="h-4 w-4" /> },
  { label: "Inscriptions", href: "/tournoi/inscriptions", icon: <UserPlus className="h-4 w-4" /> },
  { label: "Liste", href: "/tournoi/liste", icon: <List className="h-4 w-4" /> },
  { label: "Résultats", href: "/tournoi/resultats", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Classements", href: "/tournoi/classements", icon: <Medal className="h-4 w-4" /> },
];

export default function TournoiLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tournoi</h1>
        <SidebarCollapseButton collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      </div>
      <div className="flex gap-6" data-collapsed={collapsed}>
        <Sidebar items={tournoiMenu} title="Menu tournoi" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
