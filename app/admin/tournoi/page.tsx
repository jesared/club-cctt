import { requireAdminSession, TournamentAdminPage } from "./_components";
import { getCurrentTournament, getRegistrationsByTable, getTournamentTables } from "./data";

export default async function AdminTournoiPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();

  if (!tournament) {
    return (
      <TournamentAdminPage
        title="Dashboard tournoi"
        description="Aucun tournoi disponible en base pour le moment."
        activeHref="/admin/tournoi"
      />
    );
  }

  const [tournamentTables, registrationsByTable] = await Promise.all([
    getTournamentTables(tournament.id),
    getRegistrationsByTable(tournament.id),
  ]);

  const totalEarlyRevenue = tournamentTables.reduce(
    (sum, table) => sum + Number.parseInt(table.earlyPayment, 10),
    0,
  );
  const totalOnsiteRevenue = tournamentTables.reduce(
    (sum, table) => sum + Number.parseInt(table.onsitePayment, 10),
    0,
  );

  return (
    <TournamentAdminPage
      title="Dashboard tournoi"
      description={`Vue consolidée de ${tournament.name} avec les données réelles de la base.`}
      activeHref="/admin/tournoi"
      items={[
        "Planning chargé depuis TournamentEvent.",
        "Inscriptions et listes d'attente issues des enregistrements joueurs.",
        "Tarifs en ligne et sur place repris des événements du tournoi.",
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux programmés</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{tournamentTables.length}</p>
          <p className="mt-1 text-sm text-gray-600">Depuis la base tournoi</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Inscriptions suivies</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {registrationsByTable.reduce((sum, row) => sum + row.registrations, 0)}
          </p>
          <p className="mt-1 text-sm text-gray-600">Tous tableaux confondus</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recette mini anticipée</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalEarlyRevenue}€</p>
          <p className="mt-1 text-sm text-gray-600">Base 1 joueur par tableau</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recette mini sur place</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalOnsiteRevenue}€</p>
          <p className="mt-1 text-sm text-gray-600">Base 1 joueur par tableau</p>
        </article>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Programme officiel des tableaux</h2>
          <p className="text-sm text-gray-600">
            Horaires, catégories et tarifs alimentés depuis la base `Tournament` / `TournamentEvent`.
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
                <tr key={table.id} className="border-b last:border-0">
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
