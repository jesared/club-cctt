import {
  BriefcaseBusiness,
  FileCheck,
  FileText,
  FolderKanban,
  Shield,
  Wallet,
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
import { canAccessBureauSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

const bureauResources = [
  {
    title: "Gestion utilisateurs",
    description:
      "Verifier les roles bureau, club et entraineur pour garder les acces coherents.",
    href: "/admin/users",
    icon: BriefcaseBusiness,
    badge: "Disponible",
  },
  {
    title: "Contact du club",
    description:
      "Reference utile pour les informations officielles et les canaux de reponse.",
    href: "/club/contact",
    icon: FileText,
    badge: "Disponible",
  },
  {
    title: "Tarifs et adhesion",
    description:
      "Base commune pour les echanges sur cotisations, licences et inscriptions.",
    href: "/club/tarifs",
    icon: Wallet,
    badge: "Disponible",
  },
  {
    title: "Comite directeur",
    description:
      "Vue publique actuelle sur l'equipe dirigeante, utile comme point de verification.",
    href: "/club/comite-directeur",
    icon: Shield,
    badge: "Disponible",
  },
];

const bureauFolders = [
  {
    title: "Administratif",
    description: "Statuts, assurances, subventions, conventions, courriers.",
  },
  {
    title: "Reunions et decisions",
    description: "Ordres du jour, comptes-rendus, arbitrages et suivis.",
  },
  {
    title: "Tresorerie",
    description: "Budget, pieces comptables, echeances et justificatifs.",
  },
];

export default async function UserBureauDocumentsPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/bureau/documents");
  }

  if (!canAccessBureauSpace(session.user.role)) {
    redirect("/user?forbidden=bureau");
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace bureau
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Documents bureau</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cette page pose la base documentaire du bureau: d'abord avec les
            references deja presentes sur le site, puis avec des categories
            claires pour accueillir les vrais documents internes.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Ressources actives
            </p>
            <p className="text-3xl font-semibold">{bureauResources.length}</p>
            <p className="text-xs text-muted-foreground">
              Points d'entree deja exploitables par le bureau.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Dossiers a creer
            </p>
            <p className="text-3xl font-semibold">{bureauFolders.length}</p>
            <p className="text-xs text-muted-foreground">
              Familles documentaires prêtes à accueillir les contenus internes.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Usage conseille
            </p>
            <p className="text-lg font-semibold">Base de reference</p>
            <p className="text-xs text-muted-foreground">
              Unifier les sources avant de stocker de vrais fichiers reserves.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prochaine evolution
            </p>
            <p className="text-lg font-semibold">Depot bureau</p>
            <p className="text-xs text-muted-foreground">
              Ajouter ensuite comptes-rendus, PDF internes et dossiers sensibles.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">References disponibles</h2>
          <p className="text-sm text-muted-foreground">
            Ces ressources existantes peuvent deja servir de base commune au
            bureau avant l'ouverture d'une vraie bibliotheque privee.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {bureauResources.map((resource) => {
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" />
              Structure documentaire recommandee
            </CardTitle>
            <CardDescription>
              Une organisation simple pour eviter que les pieces du bureau
              partent dans tous les sens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bureauFolders.map((folder) => (
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
              <FileCheck className="h-4 w-4 text-primary" />
              Bon usage
            </CardTitle>
            <CardDescription>
              Commencer par centraliser les references, puis brancher un vrai
              depot de fichiers reserves dans une etape suivante.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
