"use client";

import { CalendarClock, Handshake, Mail, ReceiptText, Users } from "lucide-react";

import SidebarNav from "@/components/sidebar/sidebar-nav";

const clubMenuItems = [
  { href: "/club", label: "Accueil", icon: Users },
  { href: "/club/comite", label: "Comité", icon: Users },
  { href: "/club/horaires", label: "Horaires", icon: CalendarClock },
  { href: "/club/tarifs", label: "Tarifs", icon: ReceiptText },
  { href: "/club/contact", label: "Contact", icon: Mail },
  { href: "/club/partenaires", label: "Partenaires", icon: Handshake },
];

export default function ClubSidebar() {
  return <SidebarNav ariaLabel="Navigation club" items={clubMenuItems} />;
}
