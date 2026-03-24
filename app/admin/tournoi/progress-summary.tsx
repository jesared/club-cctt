import Link from "next/link";

import type { TournamentProgress } from "./data";

type ProgressSummaryProps = {
  progress: TournamentProgress;
};

const STATUS_LABEL: Record<TournamentProgress["registrationStatus"], string> = {
  CLOSED: "Inscriptions fermées",
  OPEN: "Inscriptions ouvertes",
  UPCOMING: "Inscriptions à venir",
};

export function ProgressSummary({ progress }: ProgressSummaryProps) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Avancement</h2>
        <p className="text-sm text-muted-foreground">
          Synthèse automatique pour suivre l'état du tournoi.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inscriptions
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {STATUS_LABEL[progress.registrationStatus]}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            D-jour
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">
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
          <p className="text-sm font-semibold text-foreground mt-1">
            {progress.paymentsPending}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tableaux complets
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {progress.tablesFull}/{progress.totalTables}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/tournoi/inscriptions" className="text-primary hover:underline">
          Voir inscriptions
        </Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/admin/tournoi/paiement" className="text-primary hover:underline">
          Vérifier paiements
        </Link>
      </div>
    </section>
  );
}
