import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getCurrentTournament, getTournamentTables } from "../data";

export default async function AdminTournoiAjoutPlayerPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const tournamentTables = tournament ? await getTournamentTables(tournament.id) : [];

  return (
    <TournamentAdminPage
      title="Ajouter un joueur"
      description="Préparation des champs utiles pour une inscription sur place cohérente avec les tableaux en base."
      activeHref="/admin/tournoi/ajout-player"
      items={[
        "Saisie identité, licence, club et classement.",
        "Affectation guidée vers les tableaux du tournoi courant.",
        "Application automatique du tarif sur place.",
      ]}
    >
      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Aide de saisie</h2>
        <p className="text-sm text-gray-600">
          Vérifier que le classement du joueur correspond bien à la catégorie du tableau choisi.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tournamentTables.map((table) => (
            <div key={table.id} className="rounded-lg border border-gray-200 p-3 text-sm">
              <p className="font-semibold text-gray-900">Tableau {table.table}</p>
              <p className="text-gray-600">{table.category}</p>
              <p className="text-gray-500">Sur place : {table.onsitePayment}</p>
            </div>
          ))}
        </div>
      </section>
    </TournamentAdminPage>
  );
}
