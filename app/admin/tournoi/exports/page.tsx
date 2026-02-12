import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getCurrentTournament, getTournamentTables } from "../data";

const exportsList = [
  { name: "inscriptions-tableaux.csv", description: "Inscriptions regroupées par tableau et catégorie." },
  { name: "paiements-tournoi.csv", description: "Tarifs anticipés / sur place et statut de règlement." },
  { name: "pointages-creneaux.csv", description: "Liste de pointage triée par date et horaire." },
];

export default async function AdminTournoiExportsPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const tournamentTables = tournament ? await getTournamentTables(tournament.id) : [];

  return (
    <TournamentAdminPage
      title="Exports"
      description="Préparation des exports opérationnels pour le juge-arbitre, la caisse et l'accueil."
      activeHref="/admin/tournoi/exports"
    >
      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Fichiers recommandés</h2>
        <ul className="space-y-3">
          {exportsList.map((entry) => (
            <li key={entry.name} className="rounded-lg border border-gray-200 p-3">
              <p className="font-medium text-gray-900">{entry.name}</p>
              <p className="text-sm text-gray-600">{entry.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Référence planning incluse dans les exports</h2>
        <p className="text-sm text-gray-600">
          {tournamentTables.length} tableaux sont inclus dans les fichiers de diffusion interne.
        </p>
      </section>
    </TournamentAdminPage>
  );
}
