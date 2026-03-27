import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminPaymentGroups,
  getAdminPlayers,
  getCurrentTournament,
  getRegistrationsByTable,
} from "../data";
import { PaymentsToValidate } from "./payments-to-validate";

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)} EUR`;
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
  const totalDueCents = paymentGroups.reduce((sum, group) => sum + group.totalAmountDueCents, 0);
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
  const partialPaymentsCount = paymentsToValidate.filter((group) => group.paymentStatus === "PARTIEL").length;
  const totalDossiers = paymentGroups.length;
  const paidDossiers = paymentGroups.filter((group) => group.paymentStatus === "PAYÉ").length;
  const progressPercent = totalDueCents > 0 ? Math.min(Math.round((totalCollectedCents / totalDueCents) * 100), 100) : 0;
  const topOutstanding = paymentsToValidate.filter((group) => group.remainingCents > 0).slice(0, 3);

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Contrôle des paiements en ligne et validation des dossiers en caisse.">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Encaissement global</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatEuro(totalCollectedCents)} / {formatEuro(totalDueCents)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {paidDossiers} dossier{paidDossiers > 1 ? "s" : ""} soldé{paidDossiers > 1 ? "s" : ""} sur {totalDossiers}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{progressPercent}%</p>
              <p className="text-xs text-muted-foreground">du total encaissé</p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </article>

        <article className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Priorites du jour</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Dossiers avec le reste a encaisser le plus eleve.
          </p>
          <div className="mt-3 space-y-3">
            {topOutstanding.length === 0 ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                Tous les dossiers sont soldes.
              </p>
            ) : (
              topOutstanding.map((group) => (
                <div key={group.groupKey} className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{group.payerName}</p>
                  <p className="text-xs text-muted-foreground">{group.dossierType}</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">
                    Reste : {formatEuro(group.remainingCents)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Participants</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{participantsCount}</p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Engagements</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{engagementsCount}</p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Dossiers a traiter</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{pendingPaymentsCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {partialPaymentsCount} partiel{partialPaymentsCount > 1 ? "s" : ""} a regulariser
          </p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total restant</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formatEuro(totalRemainingCents)}</p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Paiements a valider</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vue priorisee des dossiers non soldes pour accelerer les relances et la validation en caisse.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {pendingPaymentsCount} dossier{pendingPaymentsCount > 1 ? "s" : ""} a traiter
            </span>
          </div>

          {pendingPaymentsCount === 0 ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              OK : aucun paiement en attente de validation.
            </p>
          ) : null}

          <PaymentsToValidate
            initialPayments={paymentsToValidate}
            defaultStatusFilter={pendingPaymentsCount === 0 ? "PAYÉ" : "TOUS"}
          />
        </article>
      </section>
    </TournamentAdminPage>
  );
}





