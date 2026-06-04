import {
  CalendarRange,
  Dumbbell,
  FileText,
  ListChecks,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { MemberRoleHub } from "@/components/member-role-hub";
import { canAccessEntraineurSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

export default async function UserEntraineurPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/entraineur");
  }

  if (!canAccessEntraineurSpace(session.user.role)) {
    redirect("/user?forbidden=entraineur");
  }

  return (
    <MemberRoleHub
      eyebrow="Espace entraineur"
      title="Suivi sportif et organisation des groupes"
      description="Cette page centralise les acces dédiés a l'encadrement sportif, avec un point d'entree clair pour préparer les séances et retrouver les ressources utiles."
      links={[
        {
          href: "/user/entraineur",
          title: "Tableau de bord entraineur",
          description:
            "Vue d'ensemble des séances, des groupes et des points d'attention sportifs.",
          icon: Dumbbell,
        },
        {
          href: "/user/entraineur/joueurs",
          title: "Joueurs",
          description:
            "Liste des joueurs suivis, avec acces rapide aux informations utiles.",
          icon: Users,
        },
        {
          href: "/user/entraineur/groupes",
          title: "Groupes",
          description:
            "Organisation par groupe d'entrainement, niveau ou créneau.",
          icon: CalendarRange,
        },
        {
          href: "/user/entraineur/presences",
          title: "Presences",
          description:
            "Suivi des presences et absences pour garder un historique simple.",
          icon: ListChecks,
          disabled: true,
        },
        {
          href: "/user/entraineur/documents",
          title: "Documents coach",
          description:
            "Ressources pédagogiques, plannings et documents de séance.",
          icon: FileText,
        },
      ]}
    />
  );
}
