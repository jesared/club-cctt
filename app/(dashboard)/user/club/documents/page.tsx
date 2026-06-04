/* eslint-disable react/no-unescaped-entities */

import {
  CalendarClock,
  ExternalLink,
  FileText,
  FolderOpen,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { canAccessClubSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

const availableDocuments = [
  {
    title: "Horaires et créneaux",
    description:
      "Reference utile pour les séances, les ouvertures de salle et l'organisation hebdomadaire.",
    href: "/club/horaires",
    badge: "Disponible",
    icon: CalendarClock,
  },
  {
    title: "Tarifs et formules",
    description:
      "Base commune pour répondre aux questions d'adhésion, de cotisation et d'inscription.",
    href: "/club/tarifs",
    badge: "Disponible",
    icon: FileText,
  },
  {
    title: "Comite directeur",
    description:
      "Vue rapide sur les responsables du club et les interlocuteurs déjà affiches sur le site.",
    href: "/club/comite-directeur",
    badge: "Disponible",
    icon: Users,
  },
  {
    title: "Reglement du tournoi",
    description:
      "Support utile pour les benevoles ou organisateurs qui interviennent sur la partie evenementielle.",
    href: "/tournoi/reglement",
    badge: "Disponible",
    icon: ShieldCheck,
  },
];

const comingSoonFolders = [
  {
    title: "Administratif club",
    description:
      "Statuts, assurances, conventions, subventions et documents de reference.",
  },
  {
    title: "Communication",
    description:
      "Logos, affiches, visuels partenaires et modèles de publication.",
  },
  {
    title: "Organisation evenements",
    description:
      "Checklists, feuilles de route et documents utiles aux manifestations du club.",
  },
];

export default async function UserClubDocumentsPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/club/documents");
  }

  if (!canAccessClubSpace(session.user.role)) {
    redirect("/user?forbidden=club");
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace club
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Documents du club</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cette première version rassemble les ressources déjà exploitables
            dans le site et pose la structure de la future bibliotheque
            interne.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Ressources actives
            </p>
            <p className="text-3xl font-semibold">{availableDocuments.length}</p>
            <p className="text-xs text-muted-foreground">
              Liens utiles déjà consultables par l'équipe club.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bibliotheques a ouvrir
            </p>
            <p className="text-3xl font-semibold">{comingSoonFolders.length}</p>
            <p className="text-xs text-muted-foreground">
              Dossiers internes a alimenter ensuite.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Usage conseille
            </p>
            <p className="text-lg font-semibold">Base commune</p>
            <p className="text-xs text-muted-foreground">
              Utiliser cette page comme point d'entree avant un vrai dépôt de
              fichiers réservés.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prochaine etape
            </p>
            <p className="text-lg font-semibold">Dépôt interne</p>
            <p className="text-xs text-muted-foreground">
              Ajouter plus tard de vrais PDF, modèles et justificatifs réservés
              a l'équipe.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Ressources disponibles</h2>
          <p className="text-sm text-muted-foreground">
            Des points d'entree déjà utiles pour répondre aux questions
            courantes et retrouver les informations officielles du club.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {availableDocuments.map((document) => {
            const Icon = document.icon;

            return (
              <Card
                key={document.href}
                className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-full border border-primary/15 bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary">{document.badge}</Badge>
                  </div>
                  <div className="space-y-2">
                    <CardTitle>{document.title}</CardTitle>
                    <CardDescription>{document.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="px-0">
                    <Link
                      href={document.href}
                      className="inline-flex items-center gap-2"
                    >
                      Consulter
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Bibliotheques a préparer</h2>
          <p className="text-sm text-muted-foreground">
            La structure est prete pour accueillir ensuite de vrais contenus
            internes par catégorie.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {comingSoonFolders.map((folder) => (
            <Card
              key={folder.title}
              className="border-dashed border-border/80 bg-card/80 shadow-none"
            >
              <CardHeader className="space-y-3">
                <div className="rounded-full border border-border/80 bg-muted/40 p-2 text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <CardTitle>{folder.title}</CardTitle>
                  <CardDescription>{folder.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
