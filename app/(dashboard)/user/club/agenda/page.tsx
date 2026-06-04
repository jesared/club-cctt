/* eslint-disable react/no-unescaped-entities */

import {
  CalendarClock,
  CalendarDays,
  Clock3,
  Flag,
  Trophy,
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
import {
  normalizeHorairesContent,
  type HorairesData,
} from "@/lib/horaires-content";
import { prisma } from "@/lib/prisma";
import { canAccessClubSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

async function getClubSchedule() {
  const adminContent = await prisma.horairesCache.findUnique({
    where: { id: "admin" },
  });

  if (adminContent) {
    return normalizeHorairesContent(adminContent.data as Partial<HorairesData>);
  }

  const driveContent = await prisma.horairesCache.findUnique({
    where: { id: "drive" },
  });

  return normalizeHorairesContent(
    driveContent?.data as Partial<HorairesData> | null | undefined,
  );
}

function formatDateRange(startDate: Date, endDate: Date) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export default async function UserClubAgendaPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/club/agenda");
  }

  if (!canAccessClubSpace(session.user.role)) {
    redirect("/user?forbidden=club");
  }

  const [schedule, tournaments] = await Promise.all([
    getClubSchedule(),
    prisma.tournament.findMany({
      where: {
        status: {
          in: ["PUBLISHED", "SUSPENDED", "CLOSED"],
        },
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        venue: true,
        status: true,
      },
      orderBy: [{ startDate: "asc" }],
      take: 6,
    }),
  ]);

  const weeklySessions = schedule.jours.reduce(
    (count, day) => count + day.seances.length,
    0,
  );
  const nextTournament = tournaments.find(
    (tournament) => tournament.startDate >= new Date(),
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace club
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Agenda interne</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Une vue simple des rythmes du club: seances hebdomadaires, temps
            forts tournoi et points de repere utiles pour l'organisation.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Jours actifs
            </p>
            <p className="text-3xl font-semibold">{schedule.jours.length}</p>
            <p className="text-xs text-muted-foreground">
              Jours avec au moins un creneau reference.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Creneaux semaine
            </p>
            <p className="text-3xl font-semibold">{weeklySessions}</p>
            <p className="text-xs text-muted-foreground">
              Seances recensees dans l'organisation hebdomadaire.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tournois suivis
            </p>
            <p className="text-3xl font-semibold">{tournaments.length}</p>
            <p className="text-xs text-muted-foreground">
              Evenements tournoi publies ou recemment clos.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prochain temps fort
            </p>
            <p className="text-lg font-semibold">
              {nextTournament ? nextTournament.name : "A definir"}
            </p>
            <p className="text-xs text-muted-foreground">
              {nextTournament
                ? formatDateRange(nextTournament.startDate, nextTournament.endDate)
                : "Aucun evenement futur n'est publie pour le moment."}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Cadence hebdomadaire
            </CardTitle>
            <CardDescription>
              Les jours et creneaux deja references pour organiser la semaine club.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.jours.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun horaire n'est encore disponible dans le cache du club.
              </p>
            ) : (
              schedule.jours.map((day) => (
                <div
                  key={day.jour}
                  className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{day.jour}</p>
                    <span className="text-xs text-muted-foreground">
                      {day.seances.length} creneau{day.seances.length > 1 ? "x" : ""}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {day.seances.map((session, index) => (
                      <div
                        key={`${day.jour}-${index}`}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            {session.horaire || "Horaire a preciser"}
                          </p>
                          <p>{session.label || "Seance sans detail complementaire."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Temps forts tournoi
            </CardTitle>
            <CardDescription>
              Une vue rapide des evenements tournoi deja visibles dans le site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tournaments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun tournoi n'est encore publie.
              </p>
            ) : (
              tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <Flag className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{tournament.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateRange(tournament.startDate, tournament.endDate)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tournament.venue || "Lieu a confirmer"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            <Button asChild variant="outline" className="w-full">
              <Link href="/club/horaires">Voir les horaires publics</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="border-dashed border-border/80 bg-card/80 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Suite logique
          </CardTitle>
          <CardDescription>
            Plus tard, cette page pourra accueillir un vrai calendrier club avec
            reunions, manifestations et echeances administratives.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
