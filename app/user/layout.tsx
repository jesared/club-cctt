"use client";

import type { ReactNode } from "react";
import { FileText, Receipt, Settings, UserRound, ClipboardList } from "lucide-react";
import { useState } from "react";

import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";

const userMenu: SidebarItem[] = [
  { label: "Mon profil", href: "/user", icon: <UserRound className="h-4 w-4" /> },
  { label: "Mes inscriptions", href: "/user/inscriptions", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Mes paiements", href: "/user/paiements", icon: <Receipt className="h-4 w-4" /> },
  { label: "Mes documents", href: "/user/documents", icon: <FileText className="h-4 w-4" /> },
  { label: "Paramètres", href: "/user/parametres", icon: <Settings className="h-4 w-4" /> },
];

export default function UserLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Espace utilisateur</h1>
        <p className="text-muted-foreground">Vos actions personnelles et votre suivi tournoi.</p>
      </header>

      <div className="flex min-w-0 gap-6">
        <Sidebar
          items={userMenu}
          title="Menu utilisateur"
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
