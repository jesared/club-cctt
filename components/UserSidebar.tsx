"use client";

import Link from "next/link";
import { ClipboardList, FileText, House, Receipt, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const userMenu = [
  { label: "Dashboard", href: "/user", icon: House },
  { label: "Mes inscriptions", href: "/user/inscriptions", icon: ClipboardList },
  { label: "Paiements", href: "/user/paiements", icon: Receipt },
  { label: "Documents", href: "/user/documents", icon: FileText },
  { label: "Paramètres", href: "/user/parametres", icon: Settings },
];

export default function UserSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4" aria-label="Navigation utilisateur">
      <p className="mb-4 border-b pb-3 text-sm font-semibold">Espace utilisateur</p>
      <div className="flex flex-1 flex-col gap-1">
        {userMenu.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                isActive ? "bg-primary text-primary-foreground" : "text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
