"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import type { AdminPlayerRow } from "../data";

type PlayersTableProps = {
  players: AdminPlayerRow[];
};

export function PlayersTable({ players }: PlayersTableProps) {
  const [rows, setRows] = useState(players);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-action-menu]")) {
        setOpenActionId(null);
      }
    }

    if (openActionId) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openActionId]);

  async function handleDelete(registrationId: string) {
    if (!confirm("Supprimer ce joueur et ses inscriptions ?")) return;
    setLoadingId(registrationId);
    try {
      const res = await fetch("/api/admin/tournoi/pointages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.error ?? "Suppression impossible.");
        return;
      }
      setRows((current) => current.filter((row) => row.id !== registrationId));
    } finally {
      setLoadingId(null);
      setOpenActionId(null);
    }
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Dossard</th>
            <th className="py-2 pr-3 font-medium">Nom</th>
            <th className="py-2 pr-3 font-medium">Club</th>
            <th className="py-2 pr-3 font-medium">Licence</th>
            <th className="py-2 pr-3 font-medium">Classement</th>
            <th className="py-2 pr-3 font-medium">Tableau</th>
            <th className="py-2 pr-3 font-medium">Paiement</th>
            <th className="py-2 pr-3 font-medium">Statut</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((player) => (
            <tr key={player.id} className="border-b last:border-0">
              <td className="py-3 pr-3 text-muted-foreground">{player.dossard}</td>
              <td className="py-3 pr-3 text-foreground">{player.name}</td>
              <td className="py-3 pr-3 text-muted-foreground">{player.club}</td>
              <td className="py-3 pr-3 text-muted-foreground">{player.licence}</td>
              <td className="py-3 pr-3 text-muted-foreground">{player.ranking}</td>
              <td className="py-3 pr-3 text-muted-foreground">{player.table}</td>
              <td className="py-3 pr-3 text-muted-foreground">{player.payment}</td>
              <td className="py-3 pr-3 text-muted-foreground">{player.status}</td>
              <td className="py-3">
                <div className="relative" data-action-menu>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded border hover:bg-muted"
                    onClick={() =>
                      setOpenActionId((current) =>
                        current === player.id ? null : player.id,
                      )
                    }
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openActionId === player.id ? (
                    <div className="absolute right-0 z-20 mt-2 w-36 rounded-md border bg-popover p-1 shadow-md">
                      <Link
                        href={`/admin/tournoi/ajout-player?edit=${player.id}`}
                        className="block rounded px-2 py-1 text-left text-xs hover:bg-muted"
                        onClick={() => setOpenActionId(null)}
                      >
                        Editer
                      </Link>
                      <button
                        type="button"
                        className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                        onClick={() => handleDelete(player.id)}
                        disabled={loadingId === player.id}
                      >
                        {loadingId === player.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

