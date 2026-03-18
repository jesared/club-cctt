import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { RegistrationEventStatus } from "@prisma/client";

type PageProps = {
  searchParams?: {
    tableau?: string;
  };
};

type PlayerRow = {
  id: string;
  nomComplet: string;
  club: string;
  points: number;
  statut: "Inscrit" | "Liste d'attente" | "Pointé";
};

type EventSection = {
  id: string;
  code: string;
  nom: string;
  joueurs: PlayerRow[];
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
  const selectedTableau = searchParams?.tableau ?? "all";

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

  const sections: EventSection[] =
    tournament?.events.map((event) => {
      const joueurs = event.registrationEvents
        .map((entry) => {
          const points =
            entry.seedPointsSnapshot ?? entry.registration.player.points ?? 0;

          return {
            id: entry.id,
            nomComplet:
              `${entry.registration.player.nom} ${entry.registration.player.prenom}`.trim(),
            club: entry.registration.clubName ?? entry.registration.player.club ?? "—",
            points,
            statut: toStatusLabel(entry.status),
          };
        })
        .sort((a, b) => b.points - a.points || a.nomComplet.localeCompare(b.nomComplet));

      return {
        id: event.id,
        code: event.code,
        nom: `${event.code} · ${event.label}`,
        joueurs,
      };
    }) ?? [];

  const filteredSections = sections.filter(
    (section) => selectedTableau === "all" || section.id === selectedTableau,
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Liste des inscrits</h1>
        <p className="text-sm text-muted-foreground">
          {tournament
            ? `${tournament.name} · ${sections.reduce((sum, section) => sum + section.joueurs.length, 0)} inscription(s)`
            : "Aucun tournoi actif pour le moment."}
        </p>

        {sections.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link
              href="/tournoi/liste-inscrits"
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1 text-sm transition",
                selectedTableau === "all"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              Tous
            </Link>

            {sections.map((tableau) => (
              <Link
                key={tableau.id}
                href={`/tournoi/liste-inscrits?tableau=${tableau.id}`}
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-1 text-sm transition",
                  selectedTableau === tableau.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {tableau.code}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {filteredSections.map((tableau) => (
        <section key={tableau.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{tableau.nom}</h2>
            <span className="text-sm text-muted-foreground">
              {tableau.joueurs.length} joueurs
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
                    <th className="px-4 py-3 text-left">Points</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {tableau.joueurs.map((player, index) => (
                    <tr key={player.id} className="border-t transition hover:bg-muted/40">
                      <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{player.nomComplet}</td>
                      <td className="px-4 py-3">{player.club}</td>
                      <td className="px-4 py-3">{player.points}</td>
                      <td className="px-4 py-3">{player.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {tableau.joueurs.map((player, index) => (
              <div key={player.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {index + 1}. {player.nomComplet}
                  </p>
                  <span className="text-xs text-muted-foreground">{player.points} pts</span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">{player.club}</p>
                <p className="mt-2 text-xs text-muted-foreground">{player.statut}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {sections.length > 0 && filteredSections.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Ce filtre ne correspond à aucun tableau.
        </p>
      ) : null}

      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          Les inscriptions apparaîtront ici dès que des joueurs seront engagés.
        </p>
      ) : null}
    </main>
  );
}
