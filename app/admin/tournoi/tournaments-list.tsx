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
};

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";
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
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "DRAFT":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "ARCHIVED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "CLOSED":
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

export function TournamentsList({ tournaments }: TournamentListProps) {
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

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Liste des tournois
          </h2>
          <p className="text-sm text-muted-foreground">
            Activez un tournoi pour qu'il devienne le tournoi en cours.
          </p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun tournoi en base.</p>
      ) : (
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
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b last:border-0">
                  <td className="py-3 pr-3 font-semibold text-foreground">
                    {tournament.name}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {tournament.slug}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {formatDate(tournament.startDate)} â€” {formatDate(tournament.endDate)}
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
      )}
    </div>
  );
}


