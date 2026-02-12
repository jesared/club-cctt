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

  const paymentsToValidate = groupedPayments
    .filter((group) => group.paymentStatus !== "PAYÉ")
    .map((group) => {
      const remainingCents = Math.max(group.totalAmountDueCents - group.totalPaidCents, 0);
      const priority = remainingCents >= premiumTablePriceCents * 2 || group.registrations >= 3 ? "HAUTE" : "NORMALE";

      return {
        ...group,
        remainingCents,
        priority,
        suggestedAction:
          group.paymentStatus === "PARTIEL"
            ? "Relance douce + confirmation du solde"
            : "Vérifier règlement à l'accueil",
      };
    })
    .sort((a, b) => b.remainingCents - a.remainingCents);

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
        <article className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Paiements à valider</h2>
              <p className="mt-1 text-sm text-gray-500">
                Vue priorisée des dossiers non soldés pour accélérer les relances et la validation en caisse.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {paymentsToValidate.length} dossier{paymentsToValidate.length > 1 ? "s" : ""} à traiter
            </span>
          </div>

          {paymentsToValidate.length === 0 ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              ✅ Tout est soldé : aucun paiement en attente de validation.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Priorité</th>
                    <th className="px-4 py-3">Payeur</th>
                    <th className="px-4 py-3">Joueurs</th>
                    <th className="px-4 py-3">Reste à encaisser</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Action suggérée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {paymentsToValidate.map((group) => (
                    <tr key={group.groupKey} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            group.priority === "HAUTE"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {group.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{group.payerLabel}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{group.registrations} inscriptions</p>
                        <p className="text-xs text-gray-500">{group.players.join(", ")}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatEuro(group.remainingCents)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            group.paymentStatus === "PARTIEL" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {group.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{group.suggestedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </TournamentAdminPage>
  );
}
