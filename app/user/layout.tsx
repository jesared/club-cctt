"use client";

import type { ReactNode } from "react";
import { ClipboardList, FileText, House, Receipt, Settings } from "lucide-react";
import { useState } from "react";

import AuthButton from "@/components/AuthButton";
import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";

const userMenu: SidebarItem[] = [
  { label: "Dashboard", href: "/user", icon: <House className="h-4 w-4" />, section: "User" },
  {
    label: "Mes inscriptions",
    href: "/user/inscriptions",
    icon: <ClipboardList className="h-4 w-4" />,
    section: "User",
  },
  {
    label: "Paiements",
    href: "/user/paiements",
    icon: <Receipt className="h-4 w-4" />,
    section: "User",
  },
  {
    label: "Documents",
    href: "/user/documents",
    icon: <FileText className="h-4 w-4" />,
    section: "User",
  },
  {
    label: "Paramètres",
    href: "/user/parametres",
    icon: <Settings className="h-4 w-4" />,
    section: "User",
  },
];

export default function UserLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex min-w-0 gap-6">
        <Sidebar
          items={userMenu}
          title="Espace utilisateur"
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
          userSection={<AuthButton />}
        />
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </section>
  );
}
