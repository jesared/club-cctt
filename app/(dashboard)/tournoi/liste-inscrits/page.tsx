import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus } from "@prisma/client";

type PageProps = {
  searchParams?: Promise<{
    tableau?: string;
    club?: string;
  }>;
};

type PlayerRow = {
  id: string;
  tableauId: string;
  tableauCode: string;
  tableauNom: string;
  nomComplet: string;
  club: string;
  points: number;
  statut: "Inscrit" | "Liste d'attente" | "Pointé";
};

function toStatusLabel(status: RegistrationEventStatus): PlayerRow["statut"] {
  if (status === RegistrationEventStatus.CHECKED_IN) {
    return "Pointé";
  }

  if (status === RegistrationEventStatus.WAITLISTED) {
    return "Liste d'attente";
  }

  return "Inscrit";
}

export default async function PlayersByTablePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedTableau = resolvedSearchParams?.tableau ?? "all";
  const selectedClub = resolvedSearchParams?.club ?? "all";

  const tournament = await prisma.tournament.findFirst({
    where: {
      status: {
        in: ["PUBLISHED", "DRAFT"],
      },
    },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      events: {
        where: {
          status: {
            not: "CANCELLED",
          },
        },
        orderBy: [{ startAt: "asc" }, { code: "asc" }],
        select: {
          id: true,
          code: true,
          label: true,
          registrationEvents: {
            where: {
              status: {
                in: [
                  RegistrationEventStatus.REGISTERED,
                  RegistrationEventStatus.WAITLISTED,
                  RegistrationEventStatus.CHECKED_IN,
                  RegistrationEventStatus.NO_SHOW,
                ],
              },
              registration: {
                status: {
                  not: "CANCELLED",
                },
              },
            },
            select: {
              id: true,
              status: true,
              seedPointsSnapshot: true,
              registration: {
                select: {
                  clubName: true,
                  player: {
                    select: {
                      id: true,
                      nom: true,
                      prenom: true,
                      points: true,
                      club: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const players: PlayerRow[] =
    tournament?.events
      .flatMap((event) =>
        event.registrationEvents.map((entry) => {
          const points =
            entry.seedPointsSnapshot ?? entry.registration.player.points ?? 0;

          return {
            id: entry.id,
            tableauId: event.id,
            tableauCode: event.code,
            tableauNom: `${event.code} · ${event.label}`,
            nomComplet:
              `${entry.registration.player.nom} ${entry.registration.player.prenom}`.trim(),
            club: entry.registration.clubName ?? entry.registration.player.club ?? "—",
            points,
            statut: toStatusLabel(entry.status),
          };
        }),
      )
      .sort(
        (a, b) =>
          b.points - a.points ||
          a.nomComplet.localeCompare(b.nomComplet) ||
          a.tableauCode.localeCompare(b.tableauCode),
      ) ?? [];

  const tableaus = tournament?.events.map((event) => ({
    id: event.id,
    code: event.code,
  })) ?? [];

  const clubs = [...new Set(players.map((player) => player.club))].sort((a, b) =>
    a.localeCompare(b),
  );

  const filteredPlayers = players.filter((player) => {
    const tableauMatch =
      selectedTableau === "all" || player.tableauId === selectedTableau;
    const clubMatch = selectedClub === "all" || player.club === selectedClub;

    return tableauMatch && clubMatch;
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Liste des inscrits</h1>
        <p className="text-sm text-muted-foreground">
          {tournament
            ? `${tournament.name} · ${players.length} inscription(s)`
            : "Aucun tournoi actif pour le moment."}
        </p>

        {players.length > 0 ? (
          <form action="/tournoi/liste-inscrits" className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-medium">Filtrer par tableau</span>
              <select
                name="tableau"
                defaultValue={selectedTableau}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous les tableaux</option>
                {tableaus.map((tableau) => (
                  <option key={tableau.id} value={tableau.id}>
                    {tableau.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">Filtrer par club</span>
              <select
                name="club"
                defaultValue={selectedClub}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous les clubs</option>
                {clubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Appliquer les filtres
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Liste complète</h2>
          <span className="text-sm text-muted-foreground">
            {filteredPlayers.length} joueur(s)
          </span>
        </div>

        <div className="hidden md:block">
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Club</th>
                  <th className="px-4 py-3 text-left">Tableau</th>
                  <th className="px-4 py-3 text-left">Points</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr key={player.id} className="border-t transition hover:bg-muted/40">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{player.nomComplet}</td>
                    <td className="px-4 py-3">{player.club}</td>
                    <td className="px-4 py-3">{player.tableauNom}</td>
                    <td className="px-4 py-3">{player.points}</td>
                    <td className="px-4 py-3">{player.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {filteredPlayers.map((player, index) => (
            <div key={player.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {index + 1}. {player.nomComplet}
                </p>
                <span className="text-xs text-muted-foreground">{player.points} pts</span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">{player.club}</p>
              <p className="mt-1 text-xs text-muted-foreground">{player.tableauNom}</p>
              <p className="mt-2 text-xs text-muted-foreground">{player.statut}</p>
            </div>
          ))}
        </div>
      </section>

      {players.length > 0 && filteredPlayers.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Aucun inscrit ne correspond à ces filtres.
        </p>
      ) : null}

      {players.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Les inscriptions apparaîtront ici dès que des joueurs seront engagés.
        </p>
      ) : null}
    </main>
  );
}
