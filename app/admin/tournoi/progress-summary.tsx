import Link from "next/link";

import type { TournamentProgress } from "./data";

type ProgressSummaryProps = {
  progress: TournamentProgress;
};

const STATUS_LABEL: Record<TournamentProgress["registrationStatus"], string> = {
  CLOSED: "Inscriptions fermees",
  OPEN: "Inscriptions ouvertes",
  UPCOMING: "Inscriptions a venir",
};

export function ProgressSummary({ progress }: ProgressSummaryProps) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Avancement</h2>
        <p className="text-sm text-muted-foreground">
          Synthese automatique pour suivre l&apos;etat du tournoi.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inscriptions
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {STATUS_LABEL[progress.registrationStatus]}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            D-jour
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {progress.daysToStart === null
              ? "N/A"
              : progress.daysToStart <= 0
                ? "Tournoi en cours"
                : `J-${progress.daysToStart}`}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Paiements en attente
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {progress.paymentsPending}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tableaux complets
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {progress.tablesFull}/{progress.totalTables}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/tournoi/inscriptions"
          className="text-primary hover:underline"
        >
          Voir inscriptions
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/admin/tournoi/paiement"
          className="text-primary hover:underline"
        >
          Verifier paiements
        </Link>
      </div>
    </section>
  );
}
