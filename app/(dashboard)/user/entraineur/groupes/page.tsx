import {
  CalendarRange,
  Dumbbell,
  Layers3,
  Trophy,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  normalizeHorairesContent,
  type HorairesData,
} from "@/lib/horaires-content";
import { prisma } from "@/lib/prisma";
import { canAccessEntraineurSpace } from "@/lib/roles";
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

function getPlayerTier(points: number | null) {
  if (points === null) return "A qualifier";
  if (points < 700) return "Progression";
  if (points < 1000) return "Intermediaire";
  return "Competition";
}

export default async function UserEntraineurGroupesPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/entraineur/groupes");
  }

  if (!canAccessEntraineurSpace(session.user.role)) {
    redirect("/user?forbidden=entraineur");
  }

  const [players, schedule] = await Promise.all([
    prisma.player.findMany({
      select: {
        id: true,
        prenom: true,
        nom: true,
        points: true,
        registrations: {
          select: { id: true },
        },
      },
      orderBy: [{ points: "desc" }, { nom: "asc" }, { prenom: "asc" }],
    }),
    getClubSchedule(),
  ]);

  const tiers = [
    "Competition",
    "Intermediaire",
    "Progression",
    "A qualifier",
  ] as const;

  const groupedPlayers = tiers.map((tier) => ({
    tier,
    players: players.filter((player) => getPlayerTier(player.points) === tier),
  }));

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace entraineur
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Groupes</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cette premiere version sert a preparer les groupes a partir des
            creneaux du club et des profils joueurs deja connus. Ce ne sont pas
            encore des affectations officielles.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Joueurs consideres
            </p>
            <p className="text-3xl font-semibold">{players.length}</p>
            <p className="text-xs text-muted-foreground">
              Base actuelle pour constituer les groupes.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Creneaux club
            </p>
            <p className="text-3xl font-semibold">
              {schedule.jours.reduce((sum, day) => sum + day.seances.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              Seances disponibles pour penser la repartition.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Profils groupes
            </p>
            <p className="text-3xl font-semibold">{groupedPlayers.length}</p>
            <p className="text-xs text-muted-foreground">
              Niveaux de travail proposes pour organiser les seances.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              A retenir
            </p>
            <p className="text-lg font-semibold">Vue preparatoire</p>
            <p className="text-xs text-muted-foreground">
              A affiner ensuite avec vraies affectations et presences.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              Repartition de travail suggeree
            </CardTitle>
            <CardDescription>
              Les joueurs sont regroupes ici a partir des points connus pour
              aider a structurer les seances.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedPlayers.map((group) => (
              <div
                key={group.tier}
                className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{group.tier}</p>
                  <Badge variant="outline">
                    {group.players.length} joueur{group.players.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun joueur dans ce profil pour le moment.
                    </p>
                  ) : (
                    group.players.slice(0, 10).map((player) => (
                      <span
                        key={player.id}
                        className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {player.prenom} {player.nom}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                Appui par creneaux
              </CardTitle>
              <CardDescription>
                Les seances actuelles du club a utiliser comme base
                d'organisation des groupes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedule.jours.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun creneau n'est encore disponible.
                </p>
              ) : (
                schedule.jours.map((day) => (
                  <div key={day.jour} className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                    <p className="font-medium text-foreground">{day.jour}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {day.seances.length} creneau{day.seances.length > 1 ? "x" : ""} reference{day.seances.length > 1 ? "s" : ""}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/80 bg-card/80 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Prochaine evolution
              </CardTitle>
              <CardDescription>
                La suite naturelle sera d'ajouter de vraies affectations par
                groupe, avec presences et suivi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-primary" />
                <p>Associer chaque joueur a un groupe officiel.</p>
              </div>
              <div className="flex items-start gap-3">
                <Dumbbell className="mt-0.5 h-4 w-4 text-primary" />
                <p>Brancher ensuite les seances, presences et contenus coach.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
