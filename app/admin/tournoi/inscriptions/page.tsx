import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiInscriptionsPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Inscriptions"
      description="Liste et suivi des inscriptions pour chaque tableau du tournoi."
      activeHref="/admin/tournoi/inscriptions"
      items={[
        "Filtrer par tableau, club, catégorie et statut.",
        "Valider une inscription et gérer la liste d'attente.",
        "Accéder au détail joueur pour corriger les informations.",
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Inscriptions totales", value: "128", helper: "+12 cette semaine" },
          { label: "Validées", value: "96", helper: "75% du total" },
          { label: "En attente paiement", value: "18", helper: "Relance recommandée" },
          { label: "Liste d'attente", value: "14", helper: "2 places potentielles" },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-sm text-gray-600">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Inscriptions récentes</h2>
            <p className="text-sm text-gray-600">
              Aperçu des dernières demandes en attente de traitement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <input
              disabled
              placeholder="Recherche nom / licence"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
            <select
              disabled
              className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500"
            >
              <option>Tous les tableaux</option>
            </select>
            <select
              disabled
              className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500"
            >
              <option>Tous les statuts</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-3 font-medium">Joueur</th>
                <th className="py-2 pr-3 font-medium">Club</th>
                <th className="py-2 pr-3 font-medium">Tableau</th>
                <th className="py-2 pr-3 font-medium">Paiement</th>
                <th className="py-2 pr-3 font-medium">Statut</th>
                <th className="py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Léa Martin", "CCTT", "Série A", "Reçu", "Confirmée", "Voir la fiche"],
                ["Noah Petit", "TT Saint-Orens", "Série B", "En attente", "À valider", "Relancer"],
                ["Camille Durand", "AS Muret", "Série C", "Reçu", "Liste d'attente", "Promouvoir"],
                ["Mathis Bernard", "Ping Fronton", "Série B", "En attente", "À valider", "Valider"],
              ].map((row) => (
                <tr key={row[0]} className="border-b last:border-0">
                  {row.map((cell, idx) => (
                    <td key={`${row[0]}-${idx}`} className="py-3 pr-3 text-gray-700">
                      {idx === 4 ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {cell}
                        </span>
                      ) : idx === 5 ? (
                        <button
                          type="button"
                          disabled
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                        >
                          {cell}
                        </button>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          Maquette fonctionnelle : branchement API et actions d'administration à connecter.
        </p>
      </section>
    </TournamentAdminPage>
  );
}
