import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getAdminPlayers, getCurrentTournament } from "../data";
import { PlayersTable } from "./players-table";

export default async function AdminTournoiJoueursPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const players = tournament ? await getAdminPlayers(tournament.id) : [];

  return (
    <TournamentAdminPage
      title="Joueurs"
      description="Base joueurs consolidée depuis Player + TournamentRegistration.">
      <PlayersTable players={players} />
    </TournamentAdminPage>
  );
}



