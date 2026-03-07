import { requireAdminSession, TournamentAdminPage } from "./_components";
import {
  getCurrentTournament,
  getRegistrationsByTable,
  getTournamentDashboardStats,
  getTournamentTables,
} from "./data";
import { TournamentDashboard } from "./tournament-dashboard";

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

  const [tournamentTables, registrationsByTable, dashboardStats] =
    await Promise.all([
      getTournamentTables(tournament.id),
      getRegistrationsByTable(tournament.id),
      getTournamentDashboardStats(tournament.id),
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
    >
      <TournamentDashboard
        tournamentName={tournament.name}
        stats={dashboardStats}
      />

      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Programme officiel des tableaux
          </h2>
          <p className="text-sm text-muted-foreground">
            Horaires, catégories et tarifs alimentés depuis la base `Tournament`
            / `TournamentEvent`.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
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
                  <td className="py-3 pr-3 text-muted-foreground">
                    {table.date}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {table.time}
                  </td>
                  <td className="py-3 pr-3 font-semibold text-foreground">
                    {table.table}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {table.category}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {table.earlyPayment}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {table.onsitePayment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </TournamentAdminPage>
  );
}
