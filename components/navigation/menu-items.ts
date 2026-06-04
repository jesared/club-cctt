import {
  BadgeEuro,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardPen,
  CopyPlus,
  Download,
  Dumbbell,
  FileText,
  Handshake,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  Megaphone,
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
import {
  canAccessBureauSpace,
  canAccessClubSpace,
  canAccessEntraineurSpace,
  normalizeRole,
} from "@/lib/roles";

export type Role = "user" | "admin";
export type NavigationSession = { user?: { role?: unknown } } | null;

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
  group?: string;
  visible?: (role: unknown) => boolean;
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
      items: section.items
        .filter((item) => (item.visible ? item.visible(role) : true))
        .map((item) => ({
          ...item,
          badge: badges?.[item.href] ?? item.badge,
        })),
    }))
    .filter((section) => section.items.length > 0);
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
        group: "Personnel",
      },
      {
        href: "/user/inscriptions",
        label: "Mes inscriptions",
        icon: ClipboardPen,
        description: "Retrouver les formulaires et participations en cours.",
        group: "Personnel",
      },
      {
        href: "/user/paiements",
        label: "Mes paiements",
        icon: Receipt,
        description: "Suivre les règlements et statuts de paiement.",
        group: "Personnel",
      },
      {
        href: "/user/documents",
        label: "Mes documents",
        icon: FileText,
        description: "Télécharger les fichiers utiles et justificatifs.",
        group: "Personnel",
      },
      {
        href: "/user/club",
        label: "Espace club",
        icon: Building2,
        description: "Accéder aux annonces, documents et outils internes du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/annonces",
        label: "Club - Annonces",
        icon: Megaphone,
        description: "Consulter les annonces internes publiées pour la vie du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/documents",
        label: "Club - Documents",
        icon: FileText,
        description: "Retrouver la bibliothèque de ressources internes du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/agenda",
        label: "Club - Agenda",
        icon: CalendarDays,
        description: "Suivre les créneaux et temps forts du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/contacts",
        label: "Club - Contacts",
        icon: Users,
        description: "Voir les contacts utiles et repères de l'équipe club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/bureau",
        label: "Espace bureau",
        icon: BriefcaseBusiness,
        description: "Accéder aux outils de coordination et pilotage du bureau.",
        group: "Bureau",
        visible: canAccessBureauSpace,
      },
      {
        href: "/user/bureau/reunions",
        label: "Bureau - Réunions",
        icon: CalendarCheck,
        description: "Structurer les réunions et le suivi des décisions du bureau.",
        group: "Bureau",
        visible: canAccessBureauSpace,
      },
      {
        href: "/user/bureau/documents",
        label: "Bureau - Documents",
        icon: Banknote,
        description: "Centraliser les références et dossiers utiles au bureau.",
        group: "Bureau",
        visible: canAccessBureauSpace,
      },
      {
        href: "/user/entraineur",
        label: "Espace entraîneur",
        icon: Dumbbell,
        description: "Accéder aux vues sportives et outils de l'encadrement.",
        group: "Entraîneur",
        visible: canAccessEntraineurSpace,
      },
      {
        href: "/user/entraineur/joueurs",
        label: "Entraîneur - Joueurs",
        icon: UserPlus,
        description: "Suivre les joueurs rattachés et leur activité.",
        group: "Entraîneur",
        visible: canAccessEntraineurSpace,
      },
      {
        href: "/user/entraineur/groupes",
        label: "Entraîneur - Groupes",
        icon: Layers3,
        description: "Préparer une répartition de groupes à partir des profils.",
        group: "Entraîneur",
        visible: canAccessEntraineurSpace,
      },
      {
        href: "/user/entraineur/documents",
        label: "Entraîneur - Documents",
        icon: FileText,
        description: "Retrouver les ressources et supports utiles aux séances.",
        group: "Entraîneur",
        visible: canAccessEntraineurSpace,
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
      { href: "/tournoi/resultats", label: "Resultats", icon: Trophy },
      {
        href: "/tournoi/palmares",
        label: "Palmares",
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
        href: "/admin/notifications",
        label: "Notifications",
        icon: BellRing,
        description: "Vérifier, corriger ou retirer les alertes envoyées aux utilisateurs.",
        group: "Communication",
      },
      {
        href: "/admin/messages",
        label: "Messages",
        icon: MessageSquare,
        description: "Consulter les échanges et prioriser les demandes reçues.",
        group: "Communication",
      },
      {
        href: "/admin/users",
        label: "Utilisateurs",
        icon: Users,
        description: "Gérer les comptes, rôles et accès de l'équipe.",
        group: "Communication",
      },
      {
        href: "/admin/documentation",
        label: "Documentation",
        icon: FileText,
        description: "Retrouver les repères internes, en commençant par les rôles.",
        group: "Communication",
      },
      {
        href: "/admin/home",
        label: "Home",
        icon: LayoutGrid,
        description: "Éditer la page d'accueil et ses mises en avant.",
        group: "Contenus club",
      },
      {
        href: "/admin/comite-directeur",
        label: "Comité",
        icon: Users,
        description: "Mettre à jour l'équipe dirigeante et ses portraits.",
        group: "Contenus club",
      },
      {
        href: "/admin/horaires",
        label: "Horaires",
        icon: CalendarClock,
        description: "Ajuster les créneaux et informations pratiques du club.",
        group: "Contenus club",
      },
      {
        href: "/admin/tarifs",
        label: "Tarifs",
        icon: BadgeEuro,
        description: "Modifier les formules, montants et détails d'adhésion.",
        group: "Contenus club",
      },
      {
        href: "/admin/partenaires",
        label: "Partenaires",
        icon: Handshake,
        description: "Gérer les logos, liens et messages de soutien.",
        group: "Contenus club",
      },
      {
        href: "/admin/menu",
        label: "Menus",
        icon: Settings,
        description: "Piloter la navigation publique et les accès visibles.",
        group: "Configuration",
      },
      {
        href: "/admin/media",
        label: "Médias",
        icon: ImageIcon,
        description: "Centraliser les visuels et ressources du site.",
        group: "Configuration",
      },
      {
        href: "/admin/contact",
        label: "Contact",
        icon: Mail,
        description: "Mettre à jour les coordonnées et messages de contact.",
        group: "Configuration",
      },
      {
        href: "/admin/audit-ux",
        label: "Audit UX",
        icon: FileText,
        description: "Suivre les améliorations et retours sur l'expérience.",
        group: "Configuration",
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
        group: "Pilotage",
      },
      {
        href: "/admin/tournoi/inscriptions",
        label: "Inscriptions",
        icon: ClipboardPen,
        description: "Valider les demandes et suivre les dossiers joueurs.",
        group: "Opérations",
      },
      {
        href: "/admin/tournoi/paiement",
        label: "Paiements",
        icon: Banknote,
        description: "Vérifier les règlements et traiter les cas en attente.",
        group: "Opérations",
      },
      {
        href: "/admin/tournoi/pointages",
        label: "Pointages",
        icon: CalendarCheck,
        description: "Piloter l'accueil, la présence et les flux de salle.",
        group: "Opérations",
      },
      {
        href: "/admin/tournoi/joueurs",
        label: "Joueurs",
        icon: Users,
        description: "Explorer la base joueurs et leurs informations FFTT.",
        group: "Opérations",
      },
      {
        href: "/admin/tournoi/ajout-player",
        label: "Ajouter un joueur",
        icon: UserPlus,
        description: "Créer rapidement une inscription manuelle.",
        group: "Opérations",
      },
      {
        href: "/admin/tournoi/exports",
        label: "Exports",
        icon: Download,
        description: "Produire les fichiers utiles pour l'organisation terrain.",
        group: "Préparation",
      },
      {
        href: "/admin/tournoi/nouveau",
        label: "Nouveau tournoi",
        icon: CopyPlus,
        description: "Dupliquer une édition existante pour préparer la suivante.",
        group: "Préparation",
      },
      {
        href: "/admin/tournoi/documentation",
        label: "Documentation",
        icon: FileText,
        description: "Retrouver les modes opératoires et supports équipe.",
        group: "Préparation",
      },
    ],
  },
];

export const primaryCta = {
  href: "/contact",
  label: "Nous rejoindre",
};
