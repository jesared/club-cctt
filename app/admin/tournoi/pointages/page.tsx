import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getAdminPlayers, getCurrentTournament, getTournamentTables } from "../data";
import { PointagesGrid } from "./pointages-grid";

export default async function AdminTournoiPointagesPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const [adminPlayers, tournamentTables] = tournament
    ? await Promise.all([
        getAdminPlayers(tournament.id),
        getTournamentTables(tournament.id),
      ])
    : [[], []];

  const dayColumns = Array.from(
    new Map(tournamentTables.map((table) => [table.dayKey, { key: table.dayKey, label: table.date }])).values(),
  ).slice(0, 3);

  return (
    <TournamentAdminPage
      title="Pointages"
      description="Suivi des présences joueurs avec une grille de pointage sur 3 jours."
      activeHref="/admin/tournoi/pointages"
      items={[
        "Une ligne par joueur pour valider la présence en un clic.",
        "Trois colonnes jour pour suivre l'accueil pendant tout le week-end.",
        "Conservation du statut d'inscription comme repère administratif.",
      ]}
    >
      <PointagesGrid players={adminPlayers} dayColumns={dayColumns} tournamentTables={tournamentTables} />
    </TournamentAdminPage>
  );
}
