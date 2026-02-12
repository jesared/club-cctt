import { requireAdminSession, TournamentAdminPage } from "./_components";
import { registrationsByTable, tournamentTables } from "./data";

const totalEarlyRevenue = tournamentTables.reduce(
  (sum, table) => sum + Number.parseInt(table.earlyPayment, 10),
  0,
);
const totalOnsiteRevenue = tournamentTables.reduce(
  (sum, table) => sum + Number.parseInt(table.onsitePayment, 10),
  0,
);

export default async function AdminTournoiPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Dashboard tournoi"
      description="Vue consolidée des tableaux, horaires et paiements pour piloter le week-end du tournoi."
      activeHref="/admin/tournoi"
      items={[
        "Planning officiel importé du tournoi 2026 (tableaux A à P).",
        "Repérage immédiat des tableaux les plus chargés et des listes d'attente.",
        "Synthèse des tarifs anticipés et sur place pour la caisse.",
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux programmés</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{tournamentTables.length}</p>
          <p className="mt-1 text-sm text-gray-600">Du 4 au 6 avril</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Inscriptions suivies</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {registrationsByTable.reduce((sum, row) => sum + row.registrations, 0)}
          </p>
          <p className="mt-1 text-sm text-gray-600">Sur les tableaux prioritaires</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recette mini anticipée</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalEarlyRevenue}€</p>
          <p className="mt-1 text-sm text-gray-600">Base 1 joueur par tableau</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recette mini sur place</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalOnsiteRevenue}€</p>
          <p className="mt-1 text-sm text-gray-600">Tarification guichet</p>
        </article>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Programme officiel des tableaux</h2>
          <p className="text-sm text-gray-600">
            Données mises à jour depuis la grille du tournoi : horaires, catégories et tarifs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Horaire</th>
                <th className="py-2 pr-3 font-medium">Tableau</th>
                <th className="py-2 pr-3 font-medium">Catégorie</th>
                <th className="py-2 pr-3 font-medium">Anticipé</th>
                <th className="py-2 font-medium">Sur place</th>
              </tr>
            </thead>
            <tbody>
              {tournamentTables.map((table) => (
                <tr key={`${table.date}-${table.time}-${table.table}`} className="border-b last:border-0">
                  <td className="py-3 pr-3 text-gray-700">{table.date}</td>
                  <td className="py-3 pr-3 text-gray-700">{table.time}</td>
                  <td className="py-3 pr-3 font-semibold text-gray-900">{table.table}</td>
                  <td className="py-3 pr-3 text-gray-700">{table.category}</td>
                  <td className="py-3 pr-3 text-gray-700">{table.earlyPayment}</td>
                  <td className="py-3 text-gray-700">{table.onsitePayment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </TournamentAdminPage>
  );
}
