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
        description: "Suivre les reglements et statuts de paiement.",
        group: "Personnel",
      },
      {
        href: "/user/documents",
        label: "Mes documents",
        icon: FileText,
        description: "Telecharger les fichiers utiles et justificatifs.",
        group: "Personnel",
      },
      {
        href: "/user/parametres",
        label: "Parametres",
        icon: Settings,
        description: "Mettre a jour les preferences et acces personnels.",
        group: "Personnel",
      },
      {
        href: "/user/club",
        label: "Espace club",
        icon: Building2,
        description: "Acceder aux annonces, documents et outils internes du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/annonces",
        label: "Club - Annonces",
        icon: Megaphone,
        description: "Consulter les annonces internes publiees pour la vie du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/documents",
        label: "Club - Documents",
        icon: FileText,
        description: "Retrouver la bibliotheque de ressources internes du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/agenda",
        label: "Club - Agenda",
        icon: CalendarDays,
        description: "Suivre les creneaux et temps forts du club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/club/contacts",
        label: "Club - Contacts",
        icon: Users,
        description: "Voir les contacts utiles et reperes de l'equipe club.",
        group: "Club",
        visible: canAccessClubSpace,
      },
      {
        href: "/user/bureau",
        label: "Espace bureau",
        icon: BriefcaseBusiness,
        description: "Acceder aux outils de coordination et pilotage du bureau.",
        group: "Bureau",
        visible: canAccessBureauSpace,
      },
      {
        href: "/user/bureau/reunions",
        label: "Bureau - Reunions",
        icon: CalendarCheck,
        description: "Structurer les reunions et le suivi des decisions du bureau.",
        group: "Bureau",
        visible: canAccessBureauSpace,
      },
      {
        href: "/user/bureau/documents",
        label: "Bureau - Documents",
        icon: Banknote,
        description: "Centraliser les references et dossiers utiles au bureau.",
        group: "Bureau",
        visible: canAccessBureauSpace,
      },
      {
        href: "/user/entraineur",
        label: "Espace entraineur",
        icon: Dumbbell,
        description: "Acceder aux vues sportives et outils de l'encadrement.",
        group: "Entraineur",
        visible: canAccessEntraineurSpace,
      },
      {
        href: "/user/entraineur/joueurs",
        label: "Entraineur - Joueurs",
        icon: UserPlus,
        description: "Suivre les joueurs rattaches et leur activite.",
        group: "Entraineur",
        visible: canAccessEntraineurSpace,
      },
      {
        href: "/user/entraineur/groupes",
        label: "Entraineur - Groupes",
        icon: Layers3,
        description: "Preparer une repartition de groupes a partir des profils.",
        group: "Entraineur",
        visible: canAccessEntraineurSpace,
      },
      {
        href: "/user/entraineur/documents",
        label: "Entraineur - Documents",
        icon: FileText,
        description: "Retrouver les ressources et supports utiles aux seances.",
        group: "Entraineur",
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
        label: "Comite directeur",
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
    description: "Mettre a jour les contenus club et piloter les outils transverses.",
    roles: ["admin"],
    auth: true,
    items: [
      {
        href: "/admin/notifications",
        label: "Notifications",
        icon: BellRing,
        description: "Verifier, corriger ou retirer les alertes envoyees aux utilisateurs.",
      },
      {
        href: "/admin/messages",
        label: "Messages",
        icon: MessageSquare,
        description: "Consulter les echanges et prioriser les demandes recues.",
      },
      {
        href: "/admin/users",
        label: "Utilisateurs",
        icon: Users,
        description: "Gerer les comptes, roles et acces de l'equipe.",
      },
      {
        href: "/admin/documentation",
        label: "Documentation",
        icon: FileText,
        description: "Retrouver les reperes internes, en commencant par les roles.",
      },
      {
        href: "/admin/home",
        label: "Home",
        icon: LayoutGrid,
        description: "Editer la page d'accueil et ses mises en avant.",
      },
      {
        href: "/admin/comite-directeur",
        label: "Comite",
        icon: Users,
        description: "Mettre a jour l'equipe dirigeante et ses portraits.",
      },
      {
        href: "/admin/horaires",
        label: "Horaires",
        icon: CalendarClock,
        description: "Ajuster les creneaux et informations pratiques du club.",
      },
      {
        href: "/admin/tarifs",
        label: "Tarifs",
        icon: BadgeEuro,
        description: "Modifier les formules, montants et details d'adhesion.",
      },
      {
        href: "/admin/partenaires",
        label: "Partenaires",
        icon: Handshake,
        description: "Gerer les logos, liens et messages de soutien.",
      },
      {
        href: "/admin/menu",
        label: "Menus",
        icon: Settings,
        description: "Piloter la navigation publique et les acces visibles.",
      },
      {
        href: "/admin/media",
        label: "Medias",
        icon: ImageIcon,
        description: "Centraliser les visuels et ressources du site.",
      },
      {
        href: "/admin/contact",
        label: "Contact",
        icon: Mail,
        description: "Mettre a jour les coordonnees et messages de contact.",
      },
      {
        href: "/admin/audit-ux",
        label: "Audit UX",
        icon: FileText,
        description: "Suivre les ameliorations et retours sur l'experience.",
      },
    ],
  },
  {
    title: "Admin tournoi",
    description: "Operations du tournoi, de l'inscription jusqu'aux exports salle.",
    roles: ["admin"],
    auth: true,
    items: [
      {
        href: "/admin/tournoi",
        label: "Admin tournoi",
        icon: LayoutDashboard,
        description: "Vue d'ensemble et acces central du back-office tournoi.",
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
        description: "Verifier les reglements et traiter les cas en attente.",
      },
      {
        href: "/admin/tournoi/pointages",
        label: "Pointages",
        icon: CalendarCheck,
        description: "Piloter l'accueil, la presence et les flux de salle.",
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
        description: "Creer rapidement une inscription manuelle.",
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
        description: "Dupliquer une edition existante pour preparer la suivante.",
      },
      {
        href: "/admin/tournoi/documentation",
        label: "Documentation",
        icon: FileText,
        description: "Retrouver les modes operatoires et supports equipe.",
      },
    ],
  },
];

export const primaryCta = {
  href: "/contact",
  label: "Nous rejoindre",
};
