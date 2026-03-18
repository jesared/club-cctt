import {
  BadgeEuro,
  Banknote,
  Building2,
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
  Trophy,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Session } from "next-auth";

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
  auth?: boolean;
  items: MenuItem[];
};

export function normalizeRole(role: unknown): Role {
  if (typeof role !== "string") {
    return "user";
  }

  return role.toLowerCase() === "admin" ? "admin" : "user";
}

export function getVisibleSections({
  role,
  session,
}: {
  role: unknown;
  session: Session | null;
}) {
  const normalizedRole = normalizeRole(role);

  return navigation.filter((section) => {
    if (!section.roles.includes(normalizedRole)) return false;
    if (section.auth && !session) return false;
    return true;
  });
}
export function getVisibleSectionsHeader({
  role,
  session,
}: {
  role: unknown;
  session: Session | null;
}) {
  const normalizedRole = normalizeRole(role);

  return navigationHeader.filter((section) => {
    if (!section.roles.includes(normalizedRole)) return false;
    if (section.auth && !session) return false;
    return true;
  });
}
export const navigationHeader: MenuSection[] = [
  {
    title: "Tournoi",
    roles: ["user", "admin"],
    items: [{ href: "/tournoi", label: "Tournoi", icon: Trophy }],
  },
  {
    title: "Club",
    roles: ["user", "admin"],
    items: [{ href: "/club", label: "Club", icon: Building2 }],
  },
];
export const navigation: MenuSection[] = [
  {
    title: "Mon espace",
    roles: ["user", "admin"],
    auth: true,
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
  {
    title: "Tournoi",
    roles: ["user", "admin"],
    items: [
      { href: "/tournoi", label: "Tournoi", icon: FileText },

      {
        href: "/tournoi/inscription",
        label: "S'inscrire",
        icon: ClipboardPen,
      },
      {
        href: "/tournoi/liste-inscrits",
        label: "Liste des inscrits",
        icon: CalendarCheck,
      },
      { href: "/tournoi/resultats", label: "Résultats", icon: Trophy },
      {
        href: "/tournoi/palmares",
        label: "Palmarès",
        icon: CalendarCheck,
      },
      {
        href: "/tournoi/affiches",
        label: "Affiches",
        icon: LayoutGrid,
      },
    ],
  },
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
  {
    title: "Administration",
    roles: ["admin"],
    auth: true,
    items: [
      {
        href: "/admin/messages",
        label: "Messages",
        icon: MessageSquare,
        badge: "3",
      },
      { href: "/admin/users", label: "Utilisateurs", icon: Users },
      { href: "/admin/audit-ux", label: "Audit UX", icon: FileText },
    ],
  },
  {
    title: "Admin tournoi",
    roles: ["admin"],
    auth: true,
    items: [
      {
        href: "/admin/tournoi",
        label: "Admin tournoi",
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
