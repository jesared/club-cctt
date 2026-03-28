"use client";

import { useState } from "react";

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

export default function PaiementsClient({ rows }: Props) {
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [hidePaid, setHidePaid] = useState(false);

  const filteredRows = hidePaid
    ? rows.filter((row) => row.statusLabel !== "Payé")
    : rows;

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
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={viewMode === "cards" ? "default" : "secondary"}
          onClick={() => setViewMode("cards")}
        >
          Vue cartes
        </Button>
        <Button
          type="button"
          variant={viewMode === "list" ? "default" : "secondary"}
          onClick={() => setViewMode("list")}
        >
          Vue liste
        </Button>
        <Button
          type="button"
          variant={hidePaid ? "default" : "secondary"}
          onClick={() => setHidePaid((current) => !current)}
        >
          {hidePaid ? "Afficher payés" : "Masquer payés"}
        </Button>
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tournoi</th>
                <th className="px-4 py-3">Joueur</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Dû</th>
                <th className="px-4 py-3">Payé</th>
                <th className="px-4 py-3">Reste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">{row.tournamentName}</td>
                  <td className="px-4 py-3">{row.playerName}</td>
                  <td className="px-4 py-3">{row.statusLabel}</td>
                  <td className="px-4 py-3">{formatEuro(row.totalDueCents)}</td>
                  <td className="px-4 py-3">{formatEuro(row.paidCents)}</td>
                  <td className="px-4 py-3">
                    {formatEuro(row.remainingCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
