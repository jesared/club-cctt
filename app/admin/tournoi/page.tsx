import { requireAdminSession, TournamentAdminPage } from "./_components";
import {
  getCurrentTournament,
  getAdminTournaments,
  getTournamentDashboardStats,
  getTournamentTables,
  getTournamentProgress,
} from "./data";
import { TournamentDashboard } from "./tournament-dashboard";
import { TournamentsList } from "./tournaments-list";
import { ActionsChecklist } from "./actions-checklist";
import { ProgressSummary } from "./progress-summary";

export default async function AdminTournoiPage() {
  await requireAdminSession();

  const [tournament, tournaments] = await Promise.all([
    getCurrentTournament(),
    getAdminTournaments(),
  ]);

  if (!tournament) {
        return (
      <TournamentAdminPage
        title="Dashboard tournoi"
        description="Aucun tournoi disponible en base pour le moment.">
        <TournamentsList
          tournaments={tournaments.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            status: item.status,
            startDate: item.startDate.toISOString(),
            endDate: item.endDate.toISOString(),
          }))}
        />
      </TournamentAdminPage>
    );
  }

  const [tournamentTables, dashboardStats, progress] =
    await Promise.all([
      getTournamentTables(tournament.id),
      getTournamentDashboardStats(tournament.id),
      getTournamentProgress(tournament.id),
    ]);

  return (
    <TournamentAdminPage
      title="Dashboard tournoi"
      description={`Vue consolidée de ${tournament.name} avec les données réelles de la base.`}>
      <TournamentsList
        tournaments={tournaments.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          status: item.status,
          startDate: item.startDate.toISOString(),
          endDate: item.endDate.toISOString(),
        }))}
      />

      <ActionsChecklist />

      <ProgressSummary progress={progress} />

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







