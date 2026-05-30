import {
  Building2,
  CalendarDays,
  FileText,
  Megaphone,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { MemberRoleHub } from "@/components/member-role-hub";
import { getCurrentSession } from "@/lib/session";
import { canAccessClubSpace } from "@/lib/roles";

export default async function UserClubPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/club");
  }

  if (!canAccessClubSpace(session.user.role)) {
    redirect("/user?forbidden=club");
  }

  return (
    <MemberRoleHub
      eyebrow="Espace club"
      title="Ressources et informations du club"
      description="Retrouvez les informations internes, les documents utiles et les acces rapides lies a la vie du club. Cette page sert de point d'entree simple avant d'ouvrir des outils plus complets."
      links={[
        {
          href: "/user/club",
          title: "Tableau de bord club",
          description:
            "Vue d'ensemble des informations internes, des priorites et des acces rapides.",
          icon: Building2,
        },
        {
          href: "/user/club/documents",
          title: "Documents du club",
          description:
            "Bibliotheque des documents partages, formulaires et supports utiles.",
          icon: FileText,
        },
        {
          href: "/user/club/annonces",
          title: "Annonces internes",
          description:
            "Messages d'organisation, rappels et informations a relayer aux adherents.",
          icon: Megaphone,
        },
        {
          href: "/user/club/agenda",
          title: "Agenda interne",
          description:
            "Calendrier des evenements, reunions et temps forts a suivre.",
          icon: CalendarDays,
        },
        {
          href: "/user/club/contacts",
          title: "Contacts utiles",
          description:
            "Annuaire des interlocuteurs utiles pour la coordination du club.",
          icon: Users,
        },
      ]}
    />
  );
}
