"use client";

import {
  CalendarClock,
  Handshake,
  House,
  Mail,
  ReceiptText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const clubMenu = [
  { label: "Accueil", href: "/club", icon: House },
  {
    label: "Comité directeur",
    href: "/club/comite",
    icon: Users,
  },
  { label: "Horaires", href: "/club/horaires", icon: CalendarClock },
  { label: "Tarifs", href: "/club/tarifs", icon: ReceiptText },
  { label: "Contact", href: "/club/contact", icon: Mail },
  { label: "Partenaires", href: "/club/partenaires", icon: Handshake },
];

export default function ClubSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4" aria-label="Navigation club">
      <p className="mb-4 pb-3 text-sm font-semibold">Espace club</p>
      <div className="flex flex-1 flex-col gap-1">
        {clubMenu.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground",
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
