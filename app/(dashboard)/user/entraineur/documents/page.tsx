/* eslint-disable react/no-unescaped-entities */

import {
  CalendarRange,
  ClipboardList,
  Dumbbell,
  FileText,
  GraduationCap,
  NotebookTabs,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canAccessEntraineurSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

const coachResources = [
  {
    title: "Horaires et creneaux",
    description:
      "Reference utile pour preparer les seances et rappeler les bons horaires.",
    href: "/club/horaires",
    icon: CalendarRange,
    badge: "Disponible",
  },
  {
    title: "Liste joueurs",
    description:
      "Base de travail pour identifier les joueurs deja rattaches au site.",
    href: "/user/entraineur/joueurs",
    icon: Dumbbell,
    badge: "Disponible",
  },
  {
    title: "Tarifs et adhesion",
    description:
      "Support pratique pour les questions recurrentes des joueurs ou des familles.",
    href: "/club/tarifs",
    icon: FileText,
    badge: "Disponible",
  },
];

const coachFolders = [
  {
    title: "Seances et contenus",
    description: "Fiches d'exercices, themes d'entrainement, cycles et ateliers.",
  },
  {
    title: "Groupes et suivi",
    description: "Listes par groupe, observations, points d'attention et objectifs.",
  },
  {
    title: "Competition",
    description: "Convocations, organisation, feuilles de route et rappels utiles.",
  },
];

export default async function UserEntraineurDocumentsPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/entraineur/documents");
  }

  if (!canAccessEntraineurSpace(session.user.role)) {
    redirect("/user?forbidden=entraineur");
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace entraineur
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Documents coach</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cette page sert de base documentaire pour l'encadrement sportif,
            avec les premieres references deja presentes sur le site et une
            structure claire pour les futures ressources pedagogiques.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Ressources actives
            </p>
            <p className="text-3xl font-semibold">{coachResources.length}</p>
            <p className="text-xs text-muted-foreground">
              Liens utiles deja exploitables dans le quotidien coach.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Dossiers a ouvrir
            </p>
            <p className="text-3xl font-semibold">{coachFolders.length}</p>
            <p className="text-xs text-muted-foreground">
              Categories simples pour les supports sportifs reserves.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Usage conseille
            </p>
            <p className="text-lg font-semibold">Boite a outils</p>
            <p className="text-xs text-muted-foreground">
              Centraliser ici les contenus utiles avant, pendant et apres les seances.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prochaine evolution
            </p>
            <p className="text-lg font-semibold">Supports seances</p>
            <p className="text-xs text-muted-foreground">
              Ajouter ensuite vraies fiches d'exercices, convocations et plannings.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">References disponibles</h2>
          <p className="text-sm text-muted-foreground">
            Les premiers appuis utiles pour preparer les seances et repondre aux
            questions les plus courantes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {coachResources.map((resource) => {
            const Icon = resource.icon;

            return (
              <Card key={resource.href} className="border-border bg-card shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-full border border-primary/15 bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary">{resource.badge}</Badge>
                  </div>
                  <div className="space-y-2">
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="px-0">
                    <Link href={resource.href}>Consulter</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookTabs className="h-4 w-4 text-primary" />
              Structure recommandee
            </CardTitle>
            <CardDescription>
              Une base simple pour classer les ressources sportives et eviter
              les fichiers disperses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {coachFolders.map((folder) => (
              <div
                key={folder.title}
                className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
              >
                <p className="font-medium text-foreground">{folder.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {folder.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/80 bg-card/80 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Pistes d'enrichissement
            </CardTitle>
            <CardDescription>
              Cette page pourra accueillir ensuite des fiches seances, checklists
              de competition et supports de progression.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-4 w-4 text-primary" />
              <p>Modeles de feuille de presence et rappels de seance.</p>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <p>Fiches d'exercices classees par theme ou niveau.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
