"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import type { AdminPlayerRow } from "../data";

type PlayersTableProps = {
  players: AdminPlayerRow[];
};

export function PlayersTable({ players }: PlayersTableProps) {
  const [rows, setRows] = useState(players);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const menuRoot = target?.closest("[data-action-menu]");
      const floating = target?.closest(
        `[data-action-menu-floating="${openActionId}"]`,
      );
      if (!menuRoot && !floating) {
        setOpenActionId(null);
      }
    }

    if (openActionId) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openActionId]);

  const filteredRows = useMemo(() => {
    const normalized = searchTerm.trim().toLocaleLowerCase("fr");
    if (!normalized) {
      return rows;
    }
    return rows.filter((row) => {
      return (
        row.name.toLocaleLowerCase("fr").includes(normalized) ||
        row.club.toLocaleLowerCase("fr").includes(normalized) ||
        row.licence.toLocaleLowerCase("fr").includes(normalized)
      );
    });
  }, [rows, searchTerm]);

  const stats = useMemo(() => {
    const total = rows.length;
    const paid = rows.filter((row) => row.payment === "Payé").length;
    const waiting = rows.filter((row) => row.payment !== "Payé").length;
    const waitlist = rows.filter(
      (row) => row.status.toLowerCase() === "liste d'attente",
    ).length;
    const checked = rows.filter(
      (row) => row.status.toLowerCase() === "pointé",
    ).length;

    return {
      total,
      paid,
      waiting,
      waitlist,
      checked,
    };
  }, [rows]);

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
    <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1">
            {stats.total} joueurs
          </span>
          <span className="rounded-full border border-border bg-emerald-500/10 px-3 py-1 text-emerald-500">
            {stats.paid} payés
          </span>
          <span className="rounded-full border border-border bg-amber-500/10 px-3 py-1 text-amber-500">
            {stats.waiting} en attente
          </span>
          {stats.waitlist > 0 ? (
            <span className="rounded-full border border-border bg-slate-500/10 px-3 py-1 text-slate-400">
              {stats.waitlist} liste d'attente
            </span>
          ) : null}
          {stats.checked > 0 ? (
            <span className="rounded-full border border-border bg-blue-500/10 px-3 py-1 text-blue-500">
              {stats.checked} pointés
            </span>
          ) : null}
        </div>
        <div className="w-full sm:w-64">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un joueur"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-card">
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
          {filteredRows.map((player) => (
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
                    onClick={(event) => {
                      const rect = (
                        event.currentTarget as HTMLElement
                      ).getBoundingClientRect();
                      setMenuPosition({
                        top: rect.bottom + 8,
                        left: rect.right,
                      });
                      setOpenActionId((current) =>
                        current === player.id ? null : player.id,
                      );
                    }}
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredRows.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                Aucun joueur ne correspond aux filtres.
              </td>
            </tr>
          ) : null}
        </tbody>
        </table>
      </div>

      {openActionId && menuPosition ? (
        <div
          className="fixed z-50 w-36 rounded-md border border-border bg-popover p-1 text-xs shadow-lg"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            transform: "translateX(-100%)",
          }}
          data-action-menu-floating={openActionId}
        >
          <Link
            href={`/admin/tournoi/ajout-player?edit=${openActionId}`}
            className="block rounded px-2 py-2 text-left hover:bg-muted"
            onClick={() => setOpenActionId(null)}
          >
            Editer
          </Link>
          <button
            type="button"
            className="w-full rounded px-2 py-2 text-left hover:bg-muted"
            onClick={() => handleDelete(openActionId)}
            disabled={loadingId === openActionId}
          >
            {loadingId === openActionId ? "..." : "Supprimer"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

