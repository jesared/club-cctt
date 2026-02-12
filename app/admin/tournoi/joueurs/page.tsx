import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getAdminPlayers, getCurrentTournament } from "../data";

export default async function AdminTournoiJoueursPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const players = tournament ? await getAdminPlayers(tournament.id) : [];

  return (
    <TournamentAdminPage
      title="Joueurs"
      description="Base joueurs consolidée depuis Player + TournamentRegistration."
      activeHref="/admin/tournoi/joueurs"
      items={[
        "Vision claire des licences réellement enregistrées.",
        "Tableaux calculés depuis les inscriptions événements.",
        "Statut et mode de paiement déduits des enregistrements.",
      ]}
    >
      <section className="rounded-xl border bg-white p-6 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-3 font-medium">Nom</th>
              <th className="py-2 pr-3 font-medium">Club</th>
              <th className="py-2 pr-3 font-medium">Licence</th>
              <th className="py-2 pr-3 font-medium">Classement</th>
              <th className="py-2 pr-3 font-medium">Tableau</th>
              <th className="py-2 pr-3 font-medium">Paiement</th>
              <th className="py-2 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.licence} className="border-b last:border-0">
                <td className="py-3 pr-3 text-gray-900">{player.name}</td>
                <td className="py-3 pr-3 text-gray-700">{player.club}</td>
                <td className="py-3 pr-3 text-gray-700">{player.licence}</td>
                <td className="py-3 pr-3 text-gray-700">{player.ranking}</td>
                <td className="py-3 pr-3 text-gray-700">{player.table}</td>
                <td className="py-3 pr-3 text-gray-700">{player.payment}</td>
                <td className="py-3 text-gray-700">{player.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </TournamentAdminPage>
  );
}
