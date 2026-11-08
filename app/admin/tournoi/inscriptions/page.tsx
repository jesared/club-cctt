import Link from "next/link";
import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminRegistrationsOverview,
  getCurrentTournament,
  getRecentAdminPlayers,
  getRegistrationsByTable,
} from "../data";
import { ChevronDown, Search } from "lucide-react";
import { RecentPlayerActionsMenu } from "./recent-player-actions-menu";
type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminTournoiInscriptionsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.q?.trim() ?? "";

  const tournament = await getCurrentTournament();
  const [registrationsByTable, recentPlayers, overview] = tournament
    ? await Promise.all([
        getRegistrationsByTable(tournament.id),
        getRecentAdminPlayers(tournament.id, searchQuery, 30),
        getAdminRegistrationsOverview(tournament.id),
      ])
    : [
        [],
        [],
        {
          playerDossiers: 0,
          pendingDossiers: 0,
          activeEngagements: 0,
          checkedEngagements: 0,
          waitlistEntries: 0,
        },
      ];

  const sortedTables = [...registrationsByTable].sort((a, b) => {
    const aFull = a.maxPlayers !== null && a.registrations >= a.maxPlayers;
    const bFull = b.maxPlayers !== null && b.registrations >= b.maxPlayers;
    if (aFull !== bFull) return aFull ? -1 : 1;

    const aFill = a.maxPlayers ? a.registrations / a.maxPlayers : 0;
    const bFill = b.maxPlayers ? b.registrations / b.maxPlayers : 0;
    if (aFill !== bFill) return bFill - aFill;

    return a.table.localeCompare(b.table);
  });
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pointé":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
      case "Liste d'attente":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
      case "Annulée":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
      case "Confirmée":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200";
      case "À confirmer":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200";
      case "Mixte":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <TournamentAdminPage
      title="Inscriptions"
      description="Retrouvez les joueurs inscrits et suivez leurs engagements par tableau.">
      <section className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Joueurs inscrits</h2>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Jusqu’à 30 résultats, classés par pertinence." : "Les 30 dossiers les plus récents."}
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-2" method="GET">
          <label className="relative min-w-0 grow basis-full sm:basis-56">
            <span className="sr-only">Rechercher par nom, licence ou club</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Rechercher par nom, licence ou club"
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <button type="submit" className="h-10 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
            Rechercher
          </button>
          {searchQuery ? (
            <Link href="/admin/tournoi/inscriptions" className="inline-flex h-10 items-center rounded-md border px-3 text-sm hover:bg-muted">
              Effacer
            </Link>
          ) : null}
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Dossard</th>
                <th className="py-2 pr-3 font-medium">Joueur</th>
                <th className="py-2 pr-3 font-medium">Tableaux</th>
                <th className="py-2 pr-3 font-medium">Paiement</th>
                <th className="py-2 pr-3 font-medium">Inscription</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    {searchQuery ? "Aucun joueur trouvé pour cette recherche." : "Aucun joueur inscrit."}
                  </td>
                </tr>
              ) : null}
                {recentPlayers.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                  <td className="py-3 pr-3 text-muted-foreground">{player.dossard}</td>
                  <td className="py-3 pr-3">
                    <p className="font-medium text-foreground">{player.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {player.club} · Licence {player.licence} · {player.ranking} pts
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {player.table.split(", ").map((code) => (
                        <span key={code} className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{code}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.payment}</td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    <div className="space-y-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(player.status)}`}>
                        {player.status}
                      </span>
                      {player.statusDetail ? (
                        <p className="text-xs text-muted-foreground">{player.statusDetail}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3">
                    <RecentPlayerActionsMenu
                      playerId={player.id}
                      paymentGroupKey={player.paymentGroupKey}
                      licence={player.licence}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[ 
          { label: "Dossiers joueurs", value: `${overview.playerDossiers}`, helper: "1 dossier = 1 joueur" },
          { label: "Dossiers à relancer", value: `${overview.pendingDossiers}`, helper: "Confirmation manquante" },
          { label: "Engagements actifs", value: `${overview.activeEngagements}`, helper: "Hors liste d'attente" },
          { label: "Engagements pointés", value: `${overview.checkedEngagements}`, helper: "Présences déjà saisies" },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg outline-none">
            <div>
              <h2 className="text-xl font-semibold">Occupation des tableaux</h2>
              <p className="text-sm text-muted-foreground">
                Synthèse des séries à surveiller en priorité.
              </p>
            </div>
            <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Tableau</th>
                  <th className="py-2 pr-3 font-medium">Catégorie</th>
                  <th className="py-2 pr-3 font-medium">Inscrits</th>
                  <th className="py-2 pr-3 font-medium">Liste d&apos;attente</th>
                  <th className="py-2 pr-3 font-medium">Restants</th>
                  <th className="py-2 font-medium">Remplissage</th>
                </tr>
              </thead>
              <tbody>
                {sortedTables.map((table) => {
                  const capacity = table.maxPlayers ?? null;
                  const fillPercent =
                    capacity && capacity > 0
                      ? Math.min(Math.round((table.registrations / capacity) * 100), 100)
                      : null;
                  const isFull = capacity !== null && table.registrations >= capacity;
                  const gaugeColor =
                    fillPercent !== null && fillPercent >= 90
                      ? "bg-red-500"
                      : fillPercent !== null && fillPercent >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500";

                  return (
                    <tr key={table.table} className="border-b last:border-0">
                      <td className="py-3 pr-3 font-semibold text-foreground">{table.table}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{table.category}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{table.registrations}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{table.waitlist}</td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {capacity !== null ? Math.max(capacity - table.registrations, 0) : "—"}
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {capacity !== null ? `${table.registrations}/${capacity}` : "—"}
                            </span>
                            <span className="font-medium text-foreground">
                              {fillPercent !== null ? `${fillPercent}%` : "—"}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${gaugeColor}`}
                              style={{ width: `${fillPercent ?? 0}%` }}
                              aria-label={`Remplissage ${table.table}: ${fillPercent ?? 0}%`}
                            />
                          </div>
                          {isFull ? (
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                              Complet
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </section>

    </TournamentAdminPage>
  );
}






