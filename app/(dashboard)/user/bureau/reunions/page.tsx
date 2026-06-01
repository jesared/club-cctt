/* eslint-disable react/no-unescaped-entities */

import {
  CalendarDays,
  CheckSquare,
  Clock3,
  FileStack,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { canAccessBureauSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

const meetingChecklist = [
  "Valider la date, le lieu et les participants du prochain bureau.",
  "Rassembler les points a traiter: budget, salle, compet, communication.",
  "Noter les decisions et les responsables avant diffusion.",
  "Suivre les actions ouvertes au debut de la reunion suivante.",
];

const agendaTemplate = [
  "Tour de table rapide et points urgents",
  "Vie sportive: entrainements, equipes, tournoi, manifestations",
  "Administration: mairie, ligue, assurances, dossiers en cours",
  "Budget et tresorerie",
  "Communication et prochaines actions",
];

export default async function UserBureauReunionsPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/bureau/reunions");
  }

  if (!canAccessBureauSpace(session.user.role)) {
    redirect("/user?forbidden=bureau");
  }

  const bureauMembers = await prisma.user.findMany({
    where: {
      role: {
        in: ["BUREAU", "ADMIN"],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const adminCount = bureauMembers.filter((member) => member.role === "ADMIN").length;
  const bureauCount = bureauMembers.filter((member) => member.role === "BUREAU").length;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace bureau
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Reunions du bureau</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cette premiere version sert de base de pilotage pour organiser les
            reunions, retrouver les participants et cadrer un fonctionnement
            commun avant l'ajout de comptes-rendus structurés.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Membres bureau
            </p>
            <p className="text-3xl font-semibold">{bureauCount}</p>
            <p className="text-xs text-muted-foreground">
              Comptes explicitement identifies comme bureau.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Support admin
            </p>
            <p className="text-3xl font-semibold">{adminCount}</p>
            <p className="text-xs text-muted-foreground">
              Comptes administrateurs inclus dans l'espace bureau.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Rythme conseille
            </p>
            <p className="text-lg font-semibold">Mensuel</p>
            <p className="text-xs text-muted-foreground">
              Une cadence simple pour suivre les sujets sans perdre le fil.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prochaine evolution
            </p>
            <p className="text-lg font-semibold">Comptes-rendus</p>
            <p className="text-xs text-muted-foreground">
              Cette page pourra ensuite accueillir un vrai historique des reunions.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Ordre du jour type
            </CardTitle>
            <CardDescription>
              Un cadre simple pour lancer les reunions du bureau avec une
              structure stable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {agendaTemplate.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Check-list de preparation
            </CardTitle>
            <CardDescription>
              Les reflexes utiles pour passer d'une reunion a une vraie boucle
              de suivi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {meetingChecklist.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Participants du bureau</h2>
          <p className="text-sm text-muted-foreground">
            Les comptes deja identifies pour les acces bureau et la coordination
            des reunions.
          </p>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bureauMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={member.role === "ADMIN" ? "default" : "secondary"}
                      >
                        {member.role === "ADMIN" ? "Administrateur" : "Bureau"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {bureauMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      Aucun compte bureau n'est encore defini.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/80 bg-card/80 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileStack className="h-4 w-4 text-primary" />
              Suite logique
            </CardTitle>
            <CardDescription>
              La prochaine etape naturelle sera d'ajouter de vrais comptes-rendus
              horodates et un suivi des decisions.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
