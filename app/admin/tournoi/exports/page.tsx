import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getCurrentTournament, getTournamentTables } from "../data";

const exportsList = [
  { name: "inscriptions-tableaux.csv", description: "Inscriptions regroupées par tableau et catégorie." },
  { name: "paiements-tournoi.csv", description: "Tarifs anticipés / sur place et statut de règlement." },
  { name: "pointages-creneaux.csv", description: "Liste de pointage triée par date et horaire." },
  { name: "joueurs-tableaux.csv", description: "Liste des joueurs avec leurs tableaux associés." },
  { name: "tableaux.zip", description: "Un fichier CSV par tableau, regroupé dans un zip." },
];

export default async function AdminTournoiExportsPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const tournamentTables = tournament ? await getTournamentTables(tournament.id) : [];

  return (
    <TournamentAdminPage
      title="Exports"
      description="Préparation des exports opérationnels pour le juge-arbitre, la caisse et l'accueil.">
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Fichiers recommandés</h2>
        <ul className="space-y-3">
          {exportsList.map((entry) => (
            <li key={entry.name} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>
                {entry.name === "inscriptions-tableaux.csv" ? (
                  <a
                    href="/api/admin/tournoi/exports/inscriptions-tableaux"
                    className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/60 dark:hover:bg-muted/40"
                  >
                    Telecharger
                  </a>
                ) : entry.name === "pointages-creneaux.csv" ? (
                  <a
                    href="/api/admin/tournoi/exports/pointages-creneaux"
                    className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/60 dark:hover:bg-muted/40"
                  >
                    Telecharger
                  </a>
                ) : entry.name === "joueurs-tableaux.csv" ? (
                  <a
                    href="/api/admin/tournoi/exports/joueurs-tableaux"
                    className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/60 dark:hover:bg-muted/40"
                  >
                    Telecharger
                  </a>
                ) : entry.name === "tableaux.zip" ? (
                  <a
                    href="/api/admin/tournoi/exports/tableaux-zip"
                    className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/60 dark:hover:bg-muted/40"
                  >
                    Telecharger
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Exports par tableau</h2>
          <p className="text-sm text-muted-foreground">
            Un CSV par tableau, utile pour la table de pointage et l'affichage local.
          </p>
        </div>
        {tournamentTables.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun tableau disponible.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {tournamentTables.map((table) => (
              <li key={table.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Tableau {table.table}</p>
                    <p className="text-sm text-muted-foreground">
                      {table.category} · {table.registrations} joueurs
                    </p>
                  </div>
                  <a
                    href={`/api/admin/tournoi/exports/tableaux/${table.id}`}
                    className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted/60 dark:hover:bg-muted/40"
                  >
                    Telecharger
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Référence planning incluse dans les exports</h2>
        <p className="text-sm text-muted-foreground">
          {tournamentTables.length} tableaux sont inclus dans les fichiers de diffusion interne.
        </p>
      </section>
    </TournamentAdminPage>
  );
}





