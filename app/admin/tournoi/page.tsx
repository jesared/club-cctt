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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rythmeEditorial = [
  {
    phase: "Avant le tournoi",
    frequence: "3 publications / semaine",
    contenus: [
      "Ouverture des inscriptions",
      "Presentation des tableaux",
      "Portraits de benevoles et partenaires",
    ],
  },
  {
    phase: "Pendant le tournoi",
    frequence: "Stories quotidiennes + 1 recap/jour",
    contenus: [
      "Resultats cles de la journee",
      "Photos ambiance salle",
      "Moments forts et coulisses",
    ],
  },
  {
    phase: "Apres le tournoi",
    frequence: "2 publications la semaine suivante",
    contenus: [
      "Podiums et remerciements",
      "Best-of photos/videos",
      "Annonce de la prochaine edition",
    ],
  },
];

const preuvesSociales = [
  {
    titre: "Participation en hausse",
    valeur: "24 tableaux ouverts",
    detail:
      "Un volume qui confirme l'attractivite du tournoi au niveau regional et national.",
  },
  {
    titre: "Engagement du public",
    valeur: "300+ visiteurs sur le week-end",
    detail:
      "Parents, supporters et clubs partenaires presents pour soutenir les joueurs.",
  },
  {
    titre: "Confiance des clubs",
    valeur: "Retours positifs recurrents",
    detail:
      "Des temoignages mis en avant apres chaque edition pour rassurer les futurs participants.",
  },
];

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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rythme editorial du tournoi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Pour garder le tournoi visible et regulier, nous publions des
              contenus avant, pendant et apres l'evenement selon un planning clair.
            </p>

            <div className="space-y-4">
              {rythmeEditorial.map((item) => (
                <div key={item.phase} className="rounded-lg border p-4">
                  <p className="font-semibold text-foreground">{item.phase}</p>
                  <p className="text-sm text-primary">{item.frequence}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {item.contenus.map((contenu) => (
                      <li key={contenu}>{contenu}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preuves sociales mises en avant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Les preuves sociales permettent de montrer la credibilite du
              tournoi et d'encourager de nouvelles inscriptions.
            </p>

            <div className="grid gap-3">
              {preuvesSociales.map((preuve) => (
                <div key={preuve.titre} className="rounded-lg border p-4">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {preuve.titre}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {preuve.valeur}
                  </p>
                  <p className="text-sm mt-1">{preuve.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

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







