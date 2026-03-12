import {
  BadgeEuro,
  Banknote,
  CalendarCheck,
  CalendarClock,
  ClipboardPen,
  Download,
  FileText,
  Handshake,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessageSquare,
  Shield,
  Trophy,
  UserPlus,
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

export const tournamentMenuItems: MenuItem[] = [
  { href: "/tournoi", label: "Accueil tournoi", icon: Trophy },
  { href: "/tournoi/inscription", label: "Inscription", icon: ClipboardPen },
  {
    href: "/tournoi/mes-inscriptions",
    label: "Mes inscriptions",
    icon: CalendarCheck,
  },
  { href: "/tournoi/reglement", label: "Règlement", icon: FileText },
];

export const clubAdminMenuItems: MenuItem[] = [
  { href: "/admin", label: "Administration", icon: Shield },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/audit-ux", label: "Audit UX", icon: FileText },
];

export const tournamentAdminMenuItems: MenuItem[] = [
  { href: "/admin/tournoi", label: "Admin tournoi", icon: LayoutDashboard },
  {
    href: "/admin/tournoi/inscriptions",
    label: "Inscriptions",
    icon: ClipboardPen,
  },
  { href: "/admin/tournoi/paiement", label: "Paiements", icon: Banknote },
  { href: "/admin/tournoi/pointages", label: "Pointages", icon: CalendarCheck },
  { href: "/admin/tournoi/joueurs", label: "Joueurs", icon: Users },
  {
    href: "/admin/tournoi/ajout-player",
    label: "Ajouter un joueur",
    icon: UserPlus,
  },
  { href: "/admin/tournoi/exports", label: "Exports", icon: Download },
];

export const primaryCta = {
  href: "/contact",
  label: "Nous rejoindre",
};
