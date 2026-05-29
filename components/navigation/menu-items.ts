import {
  BadgeEuro,
  Banknote,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardPen,
  CopyPlus,
  Download,
  FileText,
  Handshake,
  Image as ImageIcon,
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

import type { PublicMenuVisibility } from "@/lib/menu-settings";
import { isPublicMenuVisible } from "@/lib/menu-settings";
import { normalizeRole } from "@/lib/roles";

export type Role = "user" | "admin";
export type NavigationSession = { user?: { role?: unknown } } | null;

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
};

export type NavigationBadges = Partial<Record<string, string | undefined>>;

export type MenuSection = {
  title: string;
  description?: string;
  roles: Role[];
  auth?: boolean;
  items: MenuItem[];
};

export function getVisibleSections({
  role,
  session,
  menuVisibility,
  badges,
}: {
  role: unknown;
  session: NavigationSession;
  menuVisibility?: PublicMenuVisibility;
  badges?: NavigationBadges;
}) {
  const normalizedRole = normalizeRole(role);

  return navigation
    .filter((section) => {
      if (!section.roles.includes(normalizedRole)) return false;
      if (section.auth && !session) return false;
      if (
        section.title === "Tournoi" &&
        !isPublicMenuVisible(menuVisibility, "tournoi")
      ) {
        return false;
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        badge: badges?.[item.href] ?? item.badge,
      })),
    }));
}

export function getVisibleSectionsHeader({
  role,
  session,
  menuVisibility,
}: {
  role: unknown;
  session: NavigationSession;
  menuVisibility?: PublicMenuVisibility;
}) {
  const normalizedRole = normalizeRole(role);

  return navigationHeader.filter((section) => {
    if (!section.roles.includes(normalizedRole)) return false;
    if (section.auth && !session) return false;
    if (
      section.title === "Tournoi" &&
      !isPublicMenuVisible(menuVisibility, "tournoi")
    ) {
      return false;
    }
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
    description: "Raccourcis personnels, documents et suivi des actions membres.",
    roles: ["user", "admin"],
    auth: true,
    items: [
      {
        href: "/user",
        label: "Mon profil",
        icon: User,
        description: "Infos du compte et vue d'ensemble personnelle.",
      },
      {
        href: "/user/inscriptions",
        label: "Mes inscriptions",
        icon: ClipboardPen,
        description: "Retrouver les formulaires et participations en cours.",
      },
      {
        href: "/user/paiements",
        label: "Mes paiements",
        icon: Receipt,
        description: "Suivre les règlements et statuts de paiement.",
      },
      {
        href: "/user/documents",
        label: "Mes documents",
        icon: FileText,
        description: "Télécharger les fichiers utiles et justificatifs.",
      },
      {
        href: "/user/parametres",
        label: "Paramètres",
        icon: Settings,
        description: "Mettre à jour les préférences et accès personnels.",
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
    description: "Mettre à jour les contenus club et piloter les outils transverses.",
    roles: ["admin"],
    auth: true,
    items: [
      {
        href: "/admin/messages",
        label: "Messages",
        icon: MessageSquare,
        description: "Consulter les échanges et prioriser les demandes reçues.",
      },
      {
        href: "/admin/users",
        label: "Utilisateurs",
        icon: Users,
        description: "Gérer les comptes, rôles et accès de l'équipe.",
      },
      {
        href: "/admin/home",
        label: "Home",
        icon: LayoutGrid,
        description: "Éditer la page d'accueil et ses mises en avant.",
      },
      {
        href: "/admin/comite-directeur",
        label: "Comité",
        icon: Users,
        description: "Mettre à jour l'équipe dirigeante et ses portraits.",
      },
      {
        href: "/admin/horaires",
        label: "Horaires",
        icon: CalendarClock,
        description: "Ajuster les créneaux et informations pratiques du club.",
      },
      {
        href: "/admin/tarifs",
        label: "Tarifs",
        icon: BadgeEuro,
        description: "Modifier les formules, montants et détails d'adhésion.",
      },
      {
        href: "/admin/partenaires",
        label: "Partenaires",
        icon: Handshake,
        description: "Gérer les logos, liens et messages de soutien.",
      },
      {
        href: "/admin/menu",
        label: "Menus",
        icon: Settings,
        description: "Piloter la navigation publique et les accès visibles.",
      },
      {
        href: "/admin/media",
        label: "Médias",
        icon: ImageIcon,
        description: "Centraliser les visuels et ressources du site.",
      },
      {
        href: "/admin/contact",
        label: "Contact",
        icon: Mail,
        description: "Mettre à jour les coordonnées et messages de contact.",
      },
      {
        href: "/admin/audit-ux",
        label: "Audit UX",
        icon: FileText,
        description: "Suivre les améliorations et retours sur l'expérience.",
      },
    ],
  },
  {
    title: "Admin tournoi",
    description: "Opérations du tournoi, de l'inscription jusqu'aux exports salle.",
    roles: ["admin"],
    auth: true,
    items: [
      {
        href: "/admin/tournoi",
        label: "Admin tournoi",
        icon: LayoutDashboard,
        description: "Vue d'ensemble et accès central du back-office tournoi.",
      },
      {
        href: "/admin/tournoi/inscriptions",
        label: "Inscriptions",
        icon: ClipboardPen,
        description: "Valider les demandes et suivre les dossiers joueurs.",
      },
      {
        href: "/admin/tournoi/paiement",
        label: "Paiements",
        icon: Banknote,
        description: "Vérifier les règlements et traiter les cas en attente.",
      },
      {
        href: "/admin/tournoi/pointages",
        label: "Pointages",
        icon: CalendarCheck,
        description: "Piloter l'accueil, la présence et les flux de salle.",
      },
      {
        href: "/admin/tournoi/joueurs",
        label: "Joueurs",
        icon: Users,
        description: "Explorer la base joueurs et leurs informations FFTT.",
      },
      {
        href: "/admin/tournoi/ajout-player",
        label: "Ajouter un joueur",
        icon: UserPlus,
        description: "Créer rapidement une inscription manuelle.",
      },
      {
        href: "/admin/tournoi/exports",
        label: "Exports",
        icon: Download,
        description: "Produire les fichiers utiles pour l'organisation terrain.",
      },
      {
        href: "/admin/tournoi/nouveau",
        label: "Nouveau tournoi",
        icon: CopyPlus,
        description: "Dupliquer une édition existante pour préparer la suivante.",
      },
      {
        href: "/admin/tournoi/documentation",
        label: "Documentation",
        icon: FileText,
        description: "Retrouver les modes opératoires et supports équipe.",
      },
    ],
  },
];

export const primaryCta = {
  href: "/contact",
  label: "Nous rejoindre",
};
