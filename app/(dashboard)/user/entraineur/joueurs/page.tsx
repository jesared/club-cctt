import {
  BadgeCheck,
  BarChart3,
  Trophy,
  UserRound,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { canAccessEntraineurSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

function formatPlayerName(prenom: string, nom: string) {
  return `${prenom} ${nom}`.trim();
}

export default async function UserEntraineurJoueursPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/entraineur/joueurs");
  }

  if (!canAccessEntraineurSpace(session.user.role)) {
    redirect("/user?forbidden=entraineur");
  }

  const players = await prisma.player.findMany({
    select: {
      id: true,
      prenom: true,
      nom: true,
      licence: true,
      points: true,
      club: true,
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      registrations: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  const playersWithPoints = players.filter((player) => typeof player.points === "number");
  const averagePoints =
    playersWithPoints.length > 0
      ? Math.round(
          playersWithPoints.reduce((sum, player) => sum + (player.points ?? 0), 0) /
            playersWithPoints.length,
        )
      : null;
  const registeredPlayers = players.filter((player) => player.registrations.length > 0).length;
  const clubCount = new Set(
    players.map((player) => player.club?.trim()).filter(Boolean),
  ).size;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace entraineur
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Joueurs</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Premiere base de suivi sportif avec la liste des joueurs deja
            rattaches au site, leurs informations principales et leur niveau
            d'activite sur les inscriptions.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Joueurs suivis
            </p>
            <p className="text-3xl font-semibold">{players.length}</p>
            <p className="text-xs text-muted-foreground">
              Fiches joueurs actuellement rattachees a la base.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Joueurs inscrits
            </p>
            <p className="text-3xl font-semibold">{registeredPlayers}</p>
            <p className="text-xs text-muted-foreground">
              Joueurs deja utilises dans au moins une inscription.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Moyenne points
            </p>
            <p className="text-3xl font-semibold">
              {averagePoints !== null ? averagePoints : "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              Calcul fait uniquement sur les fiches avec points connus.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Clubs representes
            </p>
            <p className="text-3xl font-semibold">{clubCount}</p>
            <p className="text-xs text-muted-foreground">
              Indication simple de la diversite des clubs rattaches.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Liste joueurs
            </CardTitle>
            <CardDescription>
              Vue rapide des licenciés suivis avec leur reference, leur
              proprietaire de compte et leur historique d'inscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Licence</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Compte lie</TableHead>
                  <TableHead>Inscriptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      {formatPlayerName(player.prenom, player.nom)}
                    </TableCell>
                    <TableCell>{player.licence}</TableCell>
                    <TableCell>{player.points ?? "-"}</TableCell>
                    <TableCell>{player.club ?? "-"}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{player.owner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {player.owner.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{player.registrations.length}</TableCell>
                  </TableRow>
                ))}
                {players.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Aucun joueur n'est encore enregistre dans la base.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Lecture rapide
              </CardTitle>
              <CardDescription>
                Quelques indicateurs utiles pour un premier suivi d'effectif.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Identifier les joueurs sans points renseignes pour completer
                  les fiches progressivement.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Reperer les comptes qui gerent plusieurs joueurs pour mieux
                  suivre les familles et responsables.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Utiliser le nombre d'inscriptions comme signal simple
                  d'activite competition.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/80 bg-card/80 shadow-none">
            <CardHeader>
              <CardTitle>Suite logique</CardTitle>
              <CardDescription>
                Cette page pourra ensuite evoluer vers des groupes
                d'entrainement, des presences et des convocations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Groupes</Badge>
                <Badge variant="outline">Presences</Badge>
                <Badge variant="outline">Convocations</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
