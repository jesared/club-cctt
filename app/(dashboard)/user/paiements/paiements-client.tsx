"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PaymentRow = {
  id: string;
  tournamentName: string;
  playerName: string;
  statusLabel: string;
  totalDueCents: number;
  paidCents: number;
  remainingCents: number;
  payments: { amountCents: number; status: string; method: string | null }[];
  tables: string[];
};

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)} EUR`;
}

type Props = {
  rows: PaymentRow[];
};

function getStatusTone(statusLabel: string) {
  if (statusLabel === "Payé") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (statusLabel === "Partiel") {
    return "border-amber-400/40 bg-amber-400/10 text-amber-100";
  }

  return "border-sky-400/35 bg-sky-400/10 text-sky-100";
}

export default function PaiementsClient({ rows }: Props) {
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [hidePaid, setHidePaid] = useState(false);

  const filteredRows = hidePaid
    ? rows.filter((row) => row.statusLabel !== "Payé")
    : rows;
  const totalDueCents = rows.reduce((sum, row) => sum + row.totalDueCents, 0);
  const totalPaidCents = rows.reduce((sum, row) => sum + row.paidCents, 0);
  const totalRemainingCents = rows.reduce(
    (sum, row) => sum + row.remainingCents,
    0,
  );
  const pendingCount = rows.filter((row) => row.remainingCents > 0).length;

  if (rows.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Historique de paiement</CardTitle>
          <CardDescription>Aucun paiement trouvé pour le moment.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les paiements validés s&apos;afficheront ici après validation en
            admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Total dû
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatEuro(totalDueCents)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Déjà payé
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatEuro(totalPaidCents)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="rounded-lg bg-amber-400/10 p-2 text-amber-200">
              <Clock3 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Reste
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatEuro(totalRemainingCents)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="hidden rounded-lg bg-primary/10 p-2 text-primary sm:inline-flex">
            <WalletCards className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {filteredRows.length} dossier
              {filteredRows.length > 1 ? "s" : ""} affiché
              {filteredRows.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {pendingCount} dossier{pendingCount > 1 ? "s" : ""} avec un
              règlement restant.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "cards" ? "default" : "secondary"}
            onClick={() => setViewMode("cards")}
          >
            Vue cartes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "list" ? "default" : "secondary"}
            onClick={() => setViewMode("list")}
          >
            Vue liste
          </Button>
          <Button
            type="button"
            size="sm"
            variant={hidePaid ? "default" : "secondary"}
            onClick={() => setHidePaid((current) => !current)}
          >
            {hidePaid ? "Afficher payés" : "Masquer payés"}
          </Button>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Aucun dossier à afficher</CardTitle>
            <CardDescription>
              Ajustez les filtres pour revoir vos paiements.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : viewMode === "cards" ? (
        <section className="grid gap-4 md:grid-cols-2">
          {filteredRows.map((row) => (
            <Card key={row.id} className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  {row.tournamentName}
                </CardTitle>
                <CardDescription>{row.playerName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-border px-2 py-1 text-foreground">
                    Statut : {row.statusLabel}
                  </span>
                  {row.tables.length > 0 ? (
                    <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">
                      Tableaux : {row.tables.join(", ")}
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Montant dû</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatEuro(row.totalDueCents)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Déjà payé</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatEuro(row.paidCents)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Reste</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatEuro(row.remainingCents)}
                    </p>
                  </div>
                </div>
                {row.payments.length > 0 ? (
                  <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                    {row.payments.map((payment, index) => (
                      <div
                        key={`${row.id}-${index}`}
                        className="flex items-center justify-between border-b border-border/60 py-1 last:border-0"
                      >
                        <span>
                          {payment.status} · {payment.method}
                        </span>
                        <span>{formatEuro(payment.amountCents)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="border-b border-border/70 bg-muted/35 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Dossier</th>
                  <th className="px-4 py-3">Joueur</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Dû</th>
                  <th className="px-4 py-3 text-right">Payé</th>
                  <th className="px-4 py-3 text-right">Reste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {row.tournamentName}
                        </p>
                        {row.tables.length > 0 ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tableaux : {row.tables.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {row.playerName}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(row.statusLabel)}`}
                      >
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">
                      {formatEuro(row.totalDueCents)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">
                      {formatEuro(row.paidCents)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          row.remainingCents > 0
                            ? "text-amber-100"
                            : "text-emerald-200"
                        }`}
                      >
                        {formatEuro(row.remainingCents)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
