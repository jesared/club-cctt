import {
  BadgeEuro,
  Banknote,
  CalendarCheck,
  CalendarClock,
  ClipboardPen,
  Download,
  FileText,
  Handshake,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessageSquare,
  Receipt,
  Settings,
  Table2,
  Trophy,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Role = "user" | "admin";

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type MenuSection = {
  title: string;
  roles: Role[];
  items: MenuItem[];
};

export const navigation: MenuSection[] = [
  // ===== USER =====
  {
    title: "Mon espace",
    roles: ["user", "admin"],
    items: [
      { href: "/user", label: "Mon profil", icon: User },
      {
        href: "/user/inscriptions",
        label: "Mes inscriptions",
        icon: ClipboardPen,
      },
      {
        href: "/user/paiements",
        label: "Mes paiements",
        icon: Receipt,
      },
      {
        href: "/user/documents",
        label: "Mes documents",
        icon: FileText,
      },
      {
        href: "/user/parametres",
        label: "Paramètres",
        icon: Settings,
      },
    ],
  },

  // ===== TOURNOI =====
  {
    title: "Tournoi",
    roles: ["user", "admin"],
    items: [
      { href: "/tournoi", label: "Présentation", icon: FileText },
      { href: "/tournoi/tableaux", label: "Tableaux", icon: Table2 },
      {
        href: "/tournoi/inscription",
        label: "Inscriptions",
        icon: ClipboardPen,
      },
      {
        href: "/tournoi/liste-inscrits",
        label: "Liste des inscrits",
        icon: CalendarCheck,
      },
      { href: "/tournoi/resultats", label: "Résultats", icon: Trophy },
      {
        href: "/tournoi/classements",
        label: "Classements",
        icon: CalendarCheck,
      },
    ],
  },

  // ===== CLUB =====
  {
    title: "Club",
    roles: ["user", "admin"],
    items: [
      { href: "/club", label: "Club", icon: LayoutGrid },
      {
        href: "/club/comite-directeur",
        label: "Comité directeur",
        icon: Users,
      },
      { href: "/club/horaires", label: "Horaires", icon: CalendarClock },
      { href: "/club/tarifs", label: "Tarifs", icon: BadgeEuro },
      {
        href: "/club/partenaires",
        label: "Partenaires",
        icon: Handshake,
      },
      { href: "/club/contact", label: "Contact", icon: Mail },
    ],
  },

  // ===== ADMIN CLUB =====
  {
    title: "Administration",
    roles: ["admin"],
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: "3" },
      { href: "/admin/users", label: "Utilisateurs", icon: Users },
      { href: "/admin/audit-ux", label: "Audit UX", icon: FileText },
    ],
  },

  // ===== ADMIN TOURNOI =====
  {
    title: "Admin tournoi",
    roles: ["admin"],
    items: [
      {
        href: "/admin/tournoi",
        label: "Vue générale",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/tournoi/inscriptions",
        label: "Inscriptions",
        icon: ClipboardPen,
      },
      {
        href: "/admin/tournoi/paiement",
        label: "Paiements",
        icon: Banknote,
      },
      {
        href: "/admin/tournoi/pointages",
        label: "Pointages",
        icon: CalendarCheck,
      },
      {
        href: "/admin/tournoi/joueurs",
        label: "Joueurs",
        icon: Users,
      },
      {
        href: "/admin/tournoi/ajout-player",
        label: "Ajouter un joueur",
        icon: UserPlus,
      },
      {
        href: "/admin/tournoi/exports",
        label: "Exports",
        icon: Download,
      },
    ],
  },
];

export const primaryCta = {
  href: "/contact",
  label: "Nous rejoindre",
};
