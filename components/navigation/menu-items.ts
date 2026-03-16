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
  Receipt,
  Settings,
  Shield,
  Table2,
  Trophy,
  User,
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
  { href: "/", label: "Home", icon: Home },
  { href: "/club", label: "Club", icon: LayoutGrid },
  { href: "/tournoi", label: "Tournoi", icon: Trophy },
  { href: "/user", label: "User", icon: User },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/horaires", label: "Horaires", icon: CalendarClock },
  { href: "/tarifs", label: "Tarifs", icon: BadgeEuro },
  { href: "/partenaires", label: "Partenaires", icon: Handshake },
  { href: "/comite-directeur", label: "Comité directeur", icon: Users },
];

export const tournamentMenuItems: MenuItem[] = [
  { href: "/tournoi", label: "Présentation", icon: FileText },
  { href: "/tournoi/tableaux", label: "Tableaux", icon: Table2 },
  { href: "/tournoi/inscription", label: "Inscriptions", icon: ClipboardPen },
  { href: "/tournoi/liste-inscrits", label: "Liste des inscrits", icon: CalendarCheck },
  { href: "/tournoi/resultats", label: "Résultats", icon: Trophy },
  { href: "/tournoi/classements", label: "Classements", icon: CalendarCheck },
];

export const userMenuItems: MenuItem[] = [
  { href: "/user", label: "Mon profil", icon: User },
  { href: "/user/inscriptions", label: "Mes inscriptions", icon: ClipboardPen },
  { href: "/user/paiements", label: "Mes paiements", icon: Receipt },
  { href: "/user/documents", label: "Mes documents", icon: FileText },
  { href: "/user/parametres", label: "Paramètres", icon: Settings },
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
