"use client";

import type { ReactNode } from "react";
import { ClipboardList, FileText, Medal, Table2, Trophy, UserPlus } from "lucide-react";
import { useState } from "react";

import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";

const tournoiMenu: SidebarItem[] = [
  { label: "Présentation", href: "/tournoi", icon: <FileText className="h-4 w-4" />, section: "Tournoi" },
  { label: "Tableaux", href: "/tournoi/tableaux", icon: <Table2 className="h-4 w-4" />, section: "Tournoi" },
  {
    label: "Inscriptions",
    href: "/tournoi/inscription",
    icon: <UserPlus className="h-4 w-4" />,
    section: "Tournoi",
  },
  {
    label: "Liste des inscrits",
    href: "/tournoi/liste-inscrits",
    icon: <ClipboardList className="h-4 w-4" />,
    section: "Tournoi",
  },
  { label: "Résultats", href: "/tournoi/resultats", icon: <ClipboardList className="h-4 w-4" />, section: "Tournoi" },
  { label: "Classements", href: "/tournoi/classements", icon: <Medal className="h-4 w-4" />, section: "Tournoi" },
];

export default function TournoiLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex min-w-0 gap-6">
        <Sidebar
          items={tournoiMenu}
          title="Menu tournoi"
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
        <div className="min-w-0 flex-1 space-y-6">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold">
                <Trophy className="h-6 w-6 text-primary" />
                Tournoi
              </h1>
              <p className="text-sm text-muted-foreground">
                Informations publiques et suivi du tournoi.
              </p>
            </div>
          </header>
          {children}
        </div>
      </div>
    </section>
  );
}
