"use client";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type TournamentItem = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  startDate: string;
  endDate: string;
};

type TournamentListProps = {
  tournaments: TournamentItem[];
  highlightedTournamentId?: string | null;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_FORMATTER.format(date);
}

function statusLabel(status: TournamentItem["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "Actif";
    case "DRAFT":
      return "Brouillon";
    case "CLOSED":
      return "Clos";
    case "ARCHIVED":
      return "Archive";
    default:
      return status;
  }
}

function statusClasses(status: TournamentItem["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "DRAFT":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "CLOSED":
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-700";
  }
}

export function TournamentsList({
  tournaments,
  highlightedTournamentId = null,
}: TournamentListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function activateTournament(id: string) {
    if (!confirm("Activer ce tournoi ?")) return;
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/tournoi/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.error ?? "Activation impossible.");
        return;
      }
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  }

  const highlightedTournament =
    tournaments.find((tournament) => tournament.id === highlightedTournamentId) ??
    tournaments.find((tournament) => tournament.status === "PUBLISHED") ??
    tournaments[0] ??
    null;

  const otherTournaments = highlightedTournament
    ? tournaments.filter((tournament) => tournament.id !== highlightedTournament.id)
    : [];

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Liste des tournois
          </h2>
          <p className="text-sm text-muted-foreground">
            Activez un tournoi pour qu&apos;il devienne le tournoi en cours.
          </p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun tournoi en base.</p>
      ) : (
        <div className="space-y-4">
          {highlightedTournament ? (
            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Tournoi prioritaire
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClasses(
                        highlightedTournament.status,
                      )}`}
                    >
                      {statusLabel(highlightedTournament.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {highlightedTournament.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {highlightedTournament.slug} · {formatDate(highlightedTournament.startDate)} -{" "}
                      {formatDate(highlightedTournament.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/tournoi/edition/${highlightedTournament.id}`}
                    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-background"
                  >
                    Modifier
                  </Link>
                  {highlightedTournament.status === "PUBLISHED" ? (
                    <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      Actif sur le site
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => activateTournament(highlightedTournament.id)}
                      disabled={loadingId === highlightedTournament.id}
                    >
                      {loadingId === highlightedTournament.id ? "Activation..." : "Activer"}
                    </Button>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {otherTournaments.length > 0 ? (
            <details className="rounded-xl border">
              <summary className="cursor-pointer list-none px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Autres editions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {otherTournaments.length} tournoi(x) replie(s) par defaut.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Afficher la liste
                  </span>
                </div>
              </summary>

              <div className="border-t px-4 py-3">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Tournoi</th>
                        <th className="py-2 pr-3 font-medium">Slug</th>
                        <th className="py-2 pr-3 font-medium">Dates</th>
                        <th className="py-2 pr-3 font-medium">Statut</th>
                        <th className="py-2 pr-3 font-medium">Edition</th>
                        <th className="py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherTournaments.map((tournament) => (
                        <tr key={tournament.id} className="border-b last:border-0">
                          <td className="py-3 pr-3 font-semibold text-foreground">
                            {tournament.name}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {tournament.slug}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClasses(
                                tournament.status,
                              )}`}
                            >
                              {statusLabel(tournament.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <Link
                              href={`/admin/tournoi/edition/${tournament.id}`}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              Modifier
                            </Link>
                          </td>
                          <td className="py-3">
                            {tournament.status === "PUBLISHED" ? (
                              <span className="text-xs font-semibold text-emerald-600">
                                Actif
                              </span>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => activateTournament(tournament.id)}
                                disabled={loadingId === tournament.id}
                              >
                                {loadingId === tournament.id ? "Activation..." : "Activer"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
