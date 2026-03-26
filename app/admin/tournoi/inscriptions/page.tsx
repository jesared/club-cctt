import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminPlayers,
  getCurrentTournament,
  getRegistrationsByTable,
} from "../data";
type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminTournoiInscriptionsPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.q?.trim().toLowerCase() ?? "";

  const tournament = await getCurrentTournament();
  const [registrationsByTable, adminPlayers] = tournament
    ? await Promise.all([
        getRegistrationsByTable(tournament.id),
        getAdminPlayers(tournament.id),
      ])
    : [[], []];

  const totalRegistrations = registrationsByTable.reduce((sum, row) => sum + row.registrations, 0);
  const totalWaitlist = registrationsByTable.reduce((sum, row) => sum + row.waitlist, 0);
  const totalCheckins = registrationsByTable.reduce((sum, row) => sum + row.checkins, 0);
  const toFollowUp = adminPlayers.filter((player) => player.status === "À confirmer").length;
  const filteredRecent = adminPlayers.filter((player) => {
    if (!searchQuery) return true;
    return (
      player.name.toLowerCase().includes(searchQuery) ||
      player.club.toLowerCase().includes(searchQuery) ||
      player.licence.toLowerCase().includes(searchQuery)
    );
  });

  const recentPlayers = [...filteredRecent]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);
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
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <TournamentAdminPage
      title="Inscriptions"
      description="Suivi détaillé des engagements par tableau avec les données Player/TournamentRegistration.">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Inscriptions suivies", value: `${totalRegistrations}`, helper: "Tous tableaux" },
          { label: "Pointages saisis", value: `${totalCheckins}`, helper: "Présences confirmées" },
          { label: "Liste d&apos;attente", value: `${totalWaitlist}`, helper: "À arbitrer" },
          { label: "À relancer", value: `${toFollowUp}`, helper: "Confirmation manquante" },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Occupation des tableaux</h2>
          <p className="text-sm text-muted-foreground">Synthèse des séries à surveiller en priorité.</p>
        </div>

        <div className="overflow-x-auto">
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
      </section>

      <section className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold">Derniers dossiers joueurs</h2>
            <p className="text-sm text-muted-foreground">
              30 derniers dossiers crees (tri par date de creation).
            </p>
          </div>
          <form className="flex items-center gap-2" method="GET">
            <input
              type="search"
              name="q"
              defaultValue={resolvedSearchParams?.q ?? ""}
              placeholder="Rechercher un joueur..."
              className="h-9 w-56 rounded-md border bg-background px-3 text-sm"
            />
            {searchQuery ? (
              <button
                type="submit"
                name="q"
                value=""
                className="inline-flex h-9 items-center rounded-md border px-3 text-xs hover:bg-muted"
              >
                Effacer
              </button>
            ) : null}
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Dossard</th>
                <th className="py-2 pr-3 font-medium">Joueur</th>
                <th className="py-2 pr-3 font-medium">Club</th>
                <th className="py-2 pr-3 font-medium">Licence</th>
                <th className="py-2 pr-3 font-medium">Classement</th>
                <th className="py-2 pr-3 font-medium">Tableau</th>
                <th className="py-2 pr-3 font-medium">Paiement</th>
                <th className="py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentPlayers.map((player) => (
                <tr key={player.licence} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 pr-3 text-muted-foreground">{player.dossard}</td>
                  <td className="py-3 pr-3 text-foreground">{player.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.club}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.licence}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.ranking}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.table}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.payment}</td>
                  <td className="py-3 text-muted-foreground">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(player.status)}`}>
                      {player.status}
                    </span>
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






