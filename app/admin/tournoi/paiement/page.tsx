import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminPaymentGroups,
  getAdminPlayers,
  getCurrentTournament,
  getRegistrationsByTable,
} from "../data";
import { PaymentsToValidate } from "./payments-to-validate";

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

function formatPaymentStatus(status: "PAYÉ" | "PARTIEL" | "EN ATTENTE") {
  if (status === "PARTIEL") {
    return "À RÉGULARISER";
  }

  return status;
}

export default async function AdminTournoiPaiementPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const [adminPlayers, registrationsByTable, paymentGroups] = tournament
    ? await Promise.all([
        getAdminPlayers(tournament.id),
        getRegistrationsByTable(tournament.id),
        getAdminPaymentGroups(tournament.id),
      ])
    : [[], [], []];

  const participantsCount = adminPlayers.length;
  const engagementsCount = registrationsByTable.reduce((sum, row) => sum + row.registrations, 0);
  const totalCollectedCents = paymentGroups.reduce((sum, group) => sum + group.totalPaidCents, 0);
  const totalRemainingCents = paymentGroups.reduce(
    (sum, group) => sum + Math.max(group.totalAmountDueCents - group.totalPaidCents, 0),
    0,
  );
  const paymentsToValidate = paymentGroups
    .map((group) => {
      const remainingCents = Math.max(group.totalAmountDueCents - group.totalPaidCents, 0);
      const priority: "HAUTE" | "NORMALE" = "NORMALE";
      const dossierType = group.registrations > 1 ? "Dossier groupé" : "Dossier individuel";
      const statusLabel = formatPaymentStatus(group.paymentStatus);

      return {
        ...group,
        dossierType,
        remainingCents,
        priority,
        statusLabel,
        suggestedAction:
          group.paymentStatus === "PARTIEL"
            ? "Refuser le partiel et demander le règlement complet du solde"
            : "Contrôler le paiement en ligne puis marquer le dossier comme réglé",
      };
    })
    .sort((a, b) => b.remainingCents - a.remainingCents);
  const pendingPaymentsCount = paymentsToValidate.filter((group) => group.paymentStatus !== "PAYÉ").length;

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Contrôle des paiements en ligne et validation des dossiers en caisse."
      activeHref="/admin/tournoi/paiement"
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Participants</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{participantsCount}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Engagements</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{engagementsCount}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total encaissé</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatEuro(totalCollectedCents)}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total restant</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatEuro(totalRemainingCents)}</p>
        </article>
      </section>


      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Paiements à valider</h2>
              <p className="mt-1 text-sm text-gray-500">
                Vue priorisée des dossiers non soldés pour accélérer les relances et la validation en caisse.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {pendingPaymentsCount} dossier{pendingPaymentsCount > 1 ? "s" : ""} à traiter
            </span>
          </div>

          {pendingPaymentsCount === 0 ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              ✅ Tout est soldé : aucun paiement en attente de validation.
            </p>
          ) : (
            <PaymentsToValidate initialPayments={paymentsToValidate} />
          )}
        </article>
      </section>
    </TournamentAdminPage>
  );
}
