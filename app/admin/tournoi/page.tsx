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
import Link from "next/link";
import { Calendar, Clock, DollarSign, ListChecks } from "lucide-react";
import EventBlockEditor from "./event-block-editor";

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

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Actions rapides</h2>
            <p className="text-sm text-muted-foreground">
              Acces direct aux ecrans les plus utilises pendant le tournoi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/tournoi/inscriptions"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Inscriptions
            </Link>
            <Link
              href="/admin/tournoi/joueurs"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Joueurs
            </Link>
            <Link
              href="/admin/tournoi/paiement"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Paiements
            </Link>
            <Link
              href="/admin/tournoi/pointages"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Pointages
            </Link>
            <Link
              href="/admin/tournoi/exports"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Exports
            </Link>
          </div>
        </div>
      </section>

      <ActionsChecklist />

      <EventBlockEditor />

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

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2 pl-3 font-medium w-10">
                  <ListChecks className="h-4 w-4" />
                </th>
                <th className="py-2 pr-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </span>
                </th>
                <th className="py-2 pr-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horaire
                  </span>
                </th>
                <th className="py-2 pr-3 font-medium">Tableau</th>
                <th className="py-2 pr-3 font-medium">Categorie</th>
                <th className="py-2 pr-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Anticipe
                  </span>
                </th>
                <th className="py-2 pr-3 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Sur place
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tournamentTables.map((table) => (
                <tr key={table.id} className="border-b last:border-0">
                  <td className="py-2 pr-2 pl-3 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary/60" />
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{table.date}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{table.time}</td>
                  <td className="py-2 pr-3 font-semibold text-foreground">
                    {table.table}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {table.category}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {table.earlyPayment}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {table.onsitePayment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="rounded-xl border bg-card p-6 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Contenu promotionnel (optionnel)
        </summary>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rythme editorial du tournoi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Pour garder le tournoi visible et regulier, nous publions des
                contenus avant, pendant et apres l&apos;evenement selon un planning clair.
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
                tournoi et d&apos;encourager de nouvelles inscriptions.
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
        </div>
      </details>
    </TournamentAdminPage>
  );
}







