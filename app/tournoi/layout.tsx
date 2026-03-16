"use client";

import type { ReactNode } from "react";
import { ClipboardList, List, Medal, Trophy, UserPlus } from "lucide-react";
import { useState } from "react";

import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";

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
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Tournoi</h1>
        <p className="text-muted-foreground">Navigation rapide des pages du tournoi.</p>
      </header>

      <div className="flex min-w-0 gap-6">
        <Sidebar
          items={tournoiMenu}
          title="Menu tournoi"
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
