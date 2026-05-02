import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminPlayers,
  getCurrentTournament,
  getTournamentTables,
} from "../data";
import { PointagesGrid } from "./pointages-grid";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminTournoiPointagesPage({
  searchParams,
}: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = await searchParams;
  const initialSearchTerm = resolvedSearchParams?.q?.trim() ?? "";

  const tournament = await getCurrentTournament();
  const [adminPlayers, tournamentTables] = tournament
    ? await Promise.all([
        getAdminPlayers(tournament.id),
        getTournamentTables(tournament.id),
      ])
    : [[], []];

  const dayColumns = Array.from(
    new Map(
      tournamentTables.map((table) => [
        table.dayKey,
        { key: table.dayKey, label: table.date },
      ]),
    ).values(),
  ).slice(0, 3);

  return (
    <TournamentAdminPage
      title="Pointages"
      description="Suivi des présences joueurs avec une grille de pointage sur 3 jours."
      showHeader={false}>
      <PointagesGrid
        players={adminPlayers}
        dayColumns={dayColumns}
        tournamentTables={tournamentTables}
        initialSearchTerm={initialSearchTerm}
      />
    </TournamentAdminPage>
  );
}
