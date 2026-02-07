import {
  BadgeEuro,
  CalendarClock,
  Handshake,
  Home,
  LayoutGrid,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const mainMenuItems: MenuItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/club", label: "Le club", icon: LayoutGrid },
  { href: "/comite-directeur", label: "Comité directeur", icon: Users },
  { href: "/horaires", label: "Horaires", icon: CalendarClock },
  { href: "/tarifs", label: "Tarifs", icon: BadgeEuro },
  { href: "/partenaires", label: "Partenaires", icon: Handshake },
  { href: "/contact", label: "Contact", icon: Mail },
];

export const primaryCta = {
  href: "/contact",
  label: "Nous rejoindre",
};
