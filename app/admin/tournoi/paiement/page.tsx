import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminPaymentGroups,
  getAdminPlayers,
  getCurrentTournament,
  getTournamentTables,
} from "../data";

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

export default async function AdminTournoiPaiementPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const [adminPlayers, tournamentTables, paymentGroups] = tournament
    ? await Promise.all([
        getAdminPlayers(tournament.id),
        getTournamentTables(tournament.id),
        getAdminPaymentGroups(tournament.id),
      ])
    : [[], [], []];

  const onSitePlayers = adminPlayers.filter((player) => player.payment === "Sur place");
  const earlyPlayers = adminPlayers.filter((player) => player.payment === "Anticipé");
  const groupedPayments = paymentGroups.filter((group) => group.registrations > 1);
  const standardTablePriceCents = 800;
  const premiumTablePriceCents = 1000;

  const paymentExamples = [
    {
      title: "Exemple 1 · Inscription solo anticipée",
      description: "1 tableau standard réglé avant la date limite.",
      amountDueCents: standardTablePriceCents,
      amountPaidCents: standardTablePriceCents,
      status: "PAYÉ",
      hint: "Idéal pour valider rapidement les dossiers complets.",
    },
    {
      title: "Exemple 2 · Paiement groupé famille/club",
      description: "3 inscriptions (2 standards + 1 premium) avec un seul payeur.",
      amountDueCents: standardTablePriceCents * 2 + premiumTablePriceCents,
      amountPaidCents: standardTablePriceCents * 2,
      status: "PARTIEL",
      hint: "Relancer le payeur sur le solde restant avant clôture des tableaux.",
    },
    {
      title: "Exemple 3 · Paiement sur place",
      description: "1 tableau premium non réglé en avance.",
      amountDueCents: premiumTablePriceCents,
      amountPaidCents: 0,
      status: "EN ATTENTE",
      hint: "Préparer une file dédiée à l'accueil pour limiter l'attente le jour J.",
    },
  ];

  const recommendationItems = [
    "Ajouter une colonne “Mode de règlement” (CB, espèces, virement, chèque) pour faciliter la caisse.",
    "Créer un rappel automatique 72h avant le tournoi pour tous les paiements PARTIEL/EN ATTENTE.",
    "Mettre en avant les groupes avec >2 joueurs non soldés pour prioriser les relances.",
    "Afficher un total “reste à encaisser” global en haut de page pour piloter la trésorerie.",
  ];

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Contrôle des tarifs anticipés / sur place, avec suivi des paiements groupés par contact."
      activeHref="/admin/tournoi/paiement"
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs anticipés</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{earlyPlayers.length}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs sur place</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{onSitePlayers.length}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux standard</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tournamentTables.filter((table) => table.earlyPayment === "8€").length}
          </p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux premium</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tournamentTables.filter((table) => table.earlyPayment !== "8€").length}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-xl border bg-white shadow-sm">
        <header className="border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Paiements groupés</h2>
          <p className="mt-1 text-sm text-gray-500">
            Un groupe est construit automatiquement à partir du contact (email/téléphone) pour suivre les paiements de
            plusieurs joueurs inscrits par la même personne.
          </p>
        </header>

        {groupedPayments.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Aucun paiement groupé détecté pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Payeur</th>
                  <th className="px-4 py-3">Joueurs</th>
                  <th className="px-4 py-3">Total dû</th>
                  <th className="px-4 py-3">Déjà payé</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {groupedPayments.map((group) => (
                  <tr key={group.groupKey}>
                    <td className="px-4 py-3 font-medium text-gray-900">{group.payerLabel}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{group.registrations} inscriptions</p>
                      <p className="text-xs text-gray-500">{group.players.join(", ")}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatEuro(group.totalAmountDueCents)}</td>
                    <td className="px-4 py-3">{formatEuro(group.totalPaidCents)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          group.paymentStatus === "PAYÉ"
                            ? "bg-emerald-100 text-emerald-700"
                            : group.paymentStatus === "PARTIEL"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {group.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Exemples de paiements</h2>
          <p className="mt-1 text-sm text-gray-500">
            Cas types pour aider le pointage administratif et harmoniser les décisions de validation.
          </p>

          <div className="mt-4 space-y-3">
            {paymentExamples.map((example) => (
              <div key={example.title} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{example.title}</p>
                    <p className="text-sm text-gray-600">{example.description}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      example.status === "PAYÉ"
                        ? "bg-emerald-100 text-emerald-700"
                        : example.status === "PARTIEL"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {example.status}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-500">
                    Dû : <span className="font-medium text-gray-900">{formatEuro(example.amountDueCents)}</span>
                  </p>
                  <p className="text-gray-500">
                    Payé : <span className="font-medium text-gray-900">{formatEuro(example.amountPaidCents)}</span>
                  </p>
                </div>

                <p className="mt-2 text-xs text-indigo-700">💡 {example.hint}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Suggestions d'amélioration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Propositions concrètes pour fiabiliser le suivi des encaissements et réduire les oublis.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            {recommendationItems.map((item) => (
              <li key={item} className="flex gap-2 rounded-lg bg-gray-50 p-3">
                <span className="mt-0.5 text-indigo-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </TournamentAdminPage>
  );
}
