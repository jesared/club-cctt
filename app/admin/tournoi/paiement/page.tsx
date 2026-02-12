import { requireAdminSession, TournamentAdminPage } from "../_components";

const kpiCards = [
  { label: "Montant attendu", value: "2 560 €", helper: "128 inscriptions x 20 €" },
  { label: "Montant encaissé", value: "1 940 €", helper: "75,8% collecté" },
  { label: "Paiements en attente", value: "31", helper: "620 € à relancer" },
  { label: "Anomalies à vérifier", value: "4", helper: "Doublons / montants incohérents" },
];

const paymentMethods = [
  { method: "Espèces", count: 42, amount: "840 €", trend: "+12 aujourd'hui" },
  { method: "Carte bancaire", count: 31, amount: "620 €", trend: "+8 aujourd'hui" },
  { method: "Virement", count: 18, amount: "360 €", trend: "+3 aujourd'hui" },
  { method: "Chèque", count: 6, amount: "120 €", trend: "Stable" },
];

const pendingPayments = [
  {
    player: "Noah Petit",
    table: "Série B",
    amount: "20 €",
    dueDate: "12/10/2026",
    status: "Relance 1 à envoyer",
    channel: "Email",
  },
  {
    player: "Sarah Lopez",
    table: "Série C",
    amount: "20 €",
    dueDate: "13/10/2026",
    status: "Attente de virement",
    channel: "Téléphone",
  },
  {
    player: "Lucas Bernard",
    table: "Série A",
    amount: "10 €",
    dueDate: "11/10/2026",
    status: "Partiel encaissé",
    channel: "SMS",
  },
  {
    player: "Emma Richard",
    table: "Série D",
    amount: "20 €",
    dueDate: "10/10/2026",
    status: "En retard",
    channel: "Email + SMS",
  },
];

export default async function AdminTournoiPaiementPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Suivi des règlements d'inscription, relances et consolidation caisse en temps réel."
      activeHref="/admin/tournoi/paiement"
      items={[
        "Voir l'avancement global des encaissements par mode de paiement.",
        "Prioriser les relances selon la date d'échéance et le niveau de risque.",
        "Préparer une clôture de caisse lisible pour le juge-arbitre et le trésorier.",
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-sm text-gray-600">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Suivi des paiements en attente</h2>
              <p className="text-sm text-gray-600">
                Liste priorisée des inscriptions à relancer avec statut opérationnel.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              Export relances (bientôt)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-3 font-medium">Joueur</th>
                  <th className="py-2 pr-3 font-medium">Tableau</th>
                  <th className="py-2 pr-3 font-medium">Montant</th>
                  <th className="py-2 pr-3 font-medium">Échéance</th>
                  <th className="py-2 pr-3 font-medium">Statut</th>
                  <th className="py-2 font-medium">Canal</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr key={payment.player} className="border-b last:border-0">
                    <td className="py-3 pr-3 text-gray-700">{payment.player}</td>
                    <td className="py-3 pr-3 text-gray-700">{payment.table}</td>
                    <td className="py-3 pr-3 font-medium text-gray-900">{payment.amount}</td>
                    <td className="py-3 pr-3 text-gray-700">{payment.dueDate}</td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700">{payment.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500">
            Maquette fonctionnelle : la synchronisation avec les paiements réels sera branchée sur
            l'API tournoi.
          </p>
        </article>

        <aside className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Répartition des encaissements</h2>
            <p className="text-sm text-gray-600">Volumes collectés par mode de paiement.</p>
          </div>

          <ul className="space-y-3">
            {paymentMethods.map((entry) => (
              <li key={entry.method} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{entry.method}</p>
                  <p className="text-sm font-semibold text-gray-700">{entry.amount}</p>
                </div>
                <p className="text-xs text-gray-500">{entry.count} transactions</p>
                <p className="mt-1 text-xs text-red-600">{entry.trend}</p>
              </li>
            ))}
          </ul>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            Prochaine étape recommandée : ajouter un bouton "Marquer comme payé" directement depuis
            la table des inscriptions.
          </div>
        </aside>
      </section>
    </TournamentAdminPage>
  );
}
