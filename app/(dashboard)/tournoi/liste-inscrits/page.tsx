import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus } from "@prisma/client";
import { FiltersForm } from "./filters-form";

type PageProps = {
  searchParams?: Promise<{
    tableau?: string;
    club?: string;
  }>;
};

type PlayerRow = {
  id: string;
  tableauIds: string[];
  tableauCodes: string[];
  nomComplet: string;
  licence: string;
  club: string;
  points: number;
};

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
                  licenseNumber: true,
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

  const rawPlayers =
    tournament?.events.flatMap((event) =>
      event.registrationEvents.map((entry) => {
        const points =
          entry.seedPointsSnapshot ?? entry.registration.player.points ?? 0;

        return {
          playerId: entry.registration.player.id,
          tableauId: event.id,
          tableauCode: event.code,
          nomComplet:
            `${entry.registration.player.nom} ${entry.registration.player.prenom}`.trim(),
          licence: entry.registration.licenseNumber ?? "-",
          club:
            entry.registration.clubName ??
            entry.registration.player.club ??
            "-",
          points,
        };
      }),
    ) ?? [];

  const playersById = new Map<string, PlayerRow>();

  rawPlayers.forEach((player) => {
    const existing = playersById.get(player.playerId);

    if (!existing) {
      playersById.set(player.playerId, {
        id: player.playerId,
        tableauIds: [player.tableauId],
        tableauCodes: [player.tableauCode],
        nomComplet: player.nomComplet,
        licence: player.licence,
        club: player.club,
        points: player.points,
      });
      return;
    }

    if (!existing.tableauIds.includes(player.tableauId)) {
      existing.tableauIds.push(player.tableauId);
      existing.tableauCodes.push(player.tableauCode);
    }

    existing.points = Math.max(existing.points, player.points);
  });

  const players = [...playersById.values()].sort(
    (a, b) =>
      b.points - a.points ||
      a.nomComplet.localeCompare(b.nomComplet) ||
      a.tableauCodes.join(",").localeCompare(b.tableauCodes.join(",")),
  );

  const tableaus =
    tournament?.events.map((event) => ({
      id: event.id,
      code: event.code,
      label: event.label,
    })) ?? [];

  const tableauOptions = [
    { value: "all", label: "Tous les tableaux" },
    ...tableaus.map((tableau) => ({
      value: tableau.id,
      label: `${tableau.code} - ${tableau.label}`,
    })),
  ];

  const clubs = [...new Set(players.map((player) => player.club))].sort(
    (a, b) => a.localeCompare(b),
  );

  const clubOptions = [
    { value: "all", label: "Tous les clubs" },
    ...clubs.map((club) => ({ value: club, label: club })),
  ];

  const filteredPlayers = players.filter((player) => {
    const tableauMatch =
      selectedTableau === "all" || player.tableauIds.includes(selectedTableau);
    const clubMatch = selectedClub === "all" || player.club === selectedClub;

    return tableauMatch && clubMatch;
  });

  const totalPlayers = players.length;
  const totalClubs = clubs.length;
  const totalTableaux = tableaus.length;
  const filteredCount = filteredPlayers.length;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <Reveal>
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Liste des inscrits</h1>
            <p className="text-sm text-muted-foreground">
              {tournament
                ? `${tournament.name} - ${totalPlayers} joueur(s)`
                : "Aucun tournoi actif pour le moment."}
            </p>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Joueurs", value: `${totalPlayers}` },
              { label: "Clubs", value: `${totalClubs}` },
              { label: "Tableaux", value: `${totalTableaux}` },
              { label: "Filtre actif", value: `${filteredCount}` },
            ].map((stat, index) => (
              <Reveal key={stat.label} delay={index * 120}>
                <div className="rounded-xl border bg-card p-4 card-hover">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </section>

          {players.length > 0 ? (
            <div className="rounded-xl border bg-card p-4 card-hover">
              <FiltersForm
                selectedTableau={selectedTableau}
                selectedClub={selectedClub}
                tableauOptions={tableauOptions}
                clubOptions={clubOptions}
              />
            </div>
          ) : null}
        </div>
      </Reveal>

      <Reveal>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Liste complète</h2>
            <span className="text-sm text-muted-foreground">
              {filteredCount} joueur(s)
            </span>
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Club</th>
                    <th className="px-4 py-3 text-left">Tableau</th>
                    <th className="px-4 py-3 text-left">Points</th>
                    <th className="px-4 py-3 text-left">No licence</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlayers.map((player, index) => (
                    <tr
                      key={player.id}
                      className="border-t transition hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {player.nomComplet}
                      </td>
                      <td className="px-4 py-3">{player.club}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {player.tableauCodes.map((code) => (
                            <span
                              key={code}
                              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">{player.points}</td>
                      <td className="px-4 py-3">{player.licence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredPlayers.map((player, index) => (
              <div
                key={player.id}
                className="rounded-xl border bg-card p-4 shadow-sm card-hover"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {index + 1}. {player.nomComplet}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {player.points} pts
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {player.club}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {player.tableauCodes.map((code) => (
                    <span
                      key={code}
                      className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  No licence : {player.licence}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

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
