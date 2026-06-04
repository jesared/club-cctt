import {
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  FileStack,
  Megaphone,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";

import { MemberRoleHub } from "@/components/member-role-hub";
import { canAccessBureauSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

export default async function UserBureauPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/bureau");
  }

  if (!canAccessBureauSpace(session.user.role)) {
    redirect("/user?forbidden=bureau");
  }

  return (
    <MemberRoleHub
      eyebrow="Espace bureau"
      title="Pilotage et coordination du bureau"
      description="Ce hub regroupe les acces utiles au bureau pour suivre les decisions, organiser les priorites et centraliser les ressources de pilotage du club."
      links={[
        {
          href: "/user/bureau",
          title: "Tableau de bord bureau",
          description:
            "Vue synthese sur les priorites, les echeances et les sujets a traiter.",
          icon: BriefcaseBusiness,
        },
        {
          href: "/user/bureau/reunions",
          title: "Reunions",
          description:
            "Ordres du jour, comptes-rendus et historique des decisions du bureau.",
          icon: FileStack,
        },
        {
          href: "/user/bureau/documents",
          title: "Documents bureau",
          description:
            "Pièces administratives, references et dossiers a partager entre membres du bureau.",
          icon: FileText,
        },
        {
          href: "/user/bureau/actions",
          title: "Actions",
          description:
            "Suivi des taches et des chantiers a mener avec responsables et echeances.",
          icon: CheckSquare,
          disabled: true,
        },
        {
          href: "/user/bureau/finances",
          title: "Finances",
          description:
            "Documents de tresorerie, pièces de suivi et echeances administratives.",
          icon: Wallet,
          disabled: true,
        },
        {
          href: "/user/bureau/communication",
          title: "Communication",
          description:
            "Preparation des messages, annonces et informations a diffuser.",
          icon: Megaphone,
          disabled: true,
        },
      ]}
    />
  );
}
