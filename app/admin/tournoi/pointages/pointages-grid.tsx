"use client";

import { CircleCheckBig, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type PointagesGridPlayer = {
  id: string;
  licence: string;
  name: string;
  club: string;
  ranking: string;
  table: string;
  status: string;
  engagedEventIds: string[];
  checkedDayKeys: string[];
  registrationEventIdsByDay: Record<string, string[]>;
};

type DayColumn = {
  key: string;
  label: string;
};

type TournamentTable = {
  id: string;
  table: string;
  date: string;
  time: string;
  category: string;
  onsitePayment: string;
  minPoints: number | null;
  maxPoints: number | null;
};

type PointagesGridProps = {
  players: PointagesGridPlayer[];
  dayColumns: DayColumn[];
  tournamentTables: TournamentTable[];
};

function isEligible(points: number | null, table: TournamentTable) {
  if (points === null) {
    return true;
  }

  if (table.minPoints !== null && points < table.minPoints) {
    return false;
  }

  if (table.maxPoints !== null && points > table.maxPoints) {
    return false;
  }

  return true;
}

export function PointagesGrid({
  players,
  dayColumns,
  tournamentTables,
}: PointagesGridProps) {
  const [playersState, setPlayersState] =
    useState<PointagesGridPlayer[]>(players);
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
    () => {
      return players.reduce<Record<string, boolean>>((acc, player) => {
        player.checkedDayKeys.forEach((dayKey) => {
          acc[`${player.id}-${dayKey}`] = true;
        });
        return acc;
      }, {});
    },
  );
  const [pendingState, setPendingState] = useState<Record<string, boolean>>({});
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [selectedPointageFilter, setSelectedPointageFilter] =
    useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingPlayer, setEditingPlayer] =
    useState<PointagesGridPlayer | null>(null);
  const [deletingPlayer, setDeletingPlayer] =
    useState<PointagesGridPlayer | null>(null);
  const [deletePending, setDeletePending] = useState<boolean>(false);
  const [selectedEditEventIds, setSelectedEditEventIds] = useState<Set<string>>(
    new Set(),
  );
  const [editPending, setEditPending] = useState<boolean>(false);

  const clubOptions = useMemo(() => {
    return Array.from(new Set(playersState.map((player) => player.club))).sort(
      (clubA, clubB) => clubA.localeCompare(clubB, "fr"),
    );
  }, [playersState]);

  const tableOptions = useMemo(() => {
    const extractedTables = playersState.flatMap((player) =>
      player.table
        .split(",")
        .map((table) => table.trim())
        .filter((table) => table && table !== "—"),
    );

    const uniqueTables = Array.from(new Set(extractedTables)).sort((tableA, tableB) =>
      tableA.localeCompare(tableB, "fr"),
    );

    return uniqueTables.map((tableCode) => {
      const matchingTournamentTable = tournamentTables.find((table) => table.table === tableCode);

      if (!matchingTournamentTable) {
        return {
          value: tableCode,
          label: tableCode,
        };
      }

      return {
        value: tableCode,
        label: `${tableCode} — ${matchingTournamentTable.category} (${matchingTournamentTable.date} · ${matchingTournamentTable.time})`,
      };
    });
  }, [playersState, tournamentTables]);

  const normalizedDayColumns = useMemo(() => {
    if (dayColumns.length >= 3) {
      return dayColumns.slice(0, 3);
    }

    return Array.from({ length: 3 }, (_, index) => ({
      key: dayColumns[index]?.key ?? `day-${index + 1}`,
      label: `Jour ${index + 1}`,
    }));
  }, [dayColumns]);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("fr");

    return playersState.filter((player) => {
      const matchesClub =
        selectedClub === "all" || player.club === selectedClub;
      const playerTables = player.table
        .split(",")
        .map((table) => table.trim())
        .filter(Boolean);
      const matchesTable =
        selectedTable === "all" || playerTables.includes(selectedTable);
      const matchesPointage =
        selectedPointageFilter === "all" ||
        (() => {
          const [status, dayKey] = selectedPointageFilter.split(":");
          if (!dayKey) {
            return true;
          }

          const hasEventForDay =
            (player.registrationEventIdsByDay[dayKey] ?? []).length > 0;

          if (!hasEventForDay) {
            return false;
          }

          const isChecked = checkedState[`${player.id}-${dayKey}`] ?? false;
          return status === "checked" ? isChecked : !isChecked;
        })();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        player.name.toLocaleLowerCase("fr").includes(normalizedSearch) ||
        player.licence.toLocaleLowerCase("fr").includes(normalizedSearch);

      return matchesClub && matchesTable && matchesPointage && matchesSearch;
    });
  }, [
    checkedState,
    playersState,
    searchTerm,
    selectedClub,
    selectedPointageFilter,
    selectedTable,
  ]);

  const parsedEditingPoints = useMemo(() => {
    if (
      !editingPlayer ||
      !editingPlayer.ranking.trim() ||
      editingPlayer.ranking === "—"
    ) {
      return null;
    }

    const numericPoints = Number.parseInt(editingPlayer.ranking, 10);
    return Number.isNaN(numericPoints) ? null : numericPoints;
  }, [editingPlayer]);

  const ineligibleTableCodes = useMemo(() => {
    return tournamentTables
      .filter((table) => !isEligible(parsedEditingPoints, table))
      .map((table) => table.table);
  }, [parsedEditingPoints, tournamentTables]);

  async function toggleCheck(player: PointagesGridPlayer, dayKey: string) {
    const key = `${player.id}-${dayKey}`;
    const eventIds = player.registrationEventIdsByDay[dayKey] ?? [];

    if (eventIds.length === 0 || pendingState[key]) {
      return;
    }

    const nextCheckedValue = !(checkedState[key] ?? false);

    setCheckedState((previousState) => ({
      ...previousState,
      [key]: nextCheckedValue,
    }));
    setPendingState((previousState) => ({ ...previousState, [key]: true }));

    try {
      const response = await fetch("/api/admin/tournoi/pointages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationEventIds: eventIds,
          checked: nextCheckedValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du pointage");
      }
    } catch {
      setCheckedState((previousState) => ({
        ...previousState,
        [key]: !nextCheckedValue,
      }));
    } finally {
      setPendingState((previousState) => ({ ...previousState, [key]: false }));
    }
  }

  function openEditPopup(player: PointagesGridPlayer) {
    setEditingPlayer(player);
    setSelectedEditEventIds(new Set(player.engagedEventIds));
  }

  async function saveEngagements() {
    if (!editingPlayer) {
      return;
    }

    const nextEventIds = Array.from(selectedEditEventIds);
    setEditPending(true);

    try {
      const response = await fetch("/api/admin/tournoi/pointages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: editingPlayer.id,
          eventIds: nextEventIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde des engagements");
      }

      const payload = (await response.json()) as {
        player?: {
          registrationId: string;
          table: string;
          engagedEventIds: string[];
          registrationEventIdsByDay: Record<string, string[]>;
          checkedDayKeys: string[];
        };
      };

      const updatedPlayer = payload.player;
      if (!updatedPlayer) {
        throw new Error("Réponse invalide");
      }

      setPlayersState((previousState) =>
        previousState.map((player) =>
          player.id === updatedPlayer.registrationId
            ? {
                ...player,
                table: updatedPlayer.table,
                engagedEventIds: updatedPlayer.engagedEventIds,
                registrationEventIdsByDay:
                  updatedPlayer.registrationEventIdsByDay,
                checkedDayKeys: updatedPlayer.checkedDayKeys,
              }
            : player,
        ),
      );

      setCheckedState((previousState) => {
        const nextState = { ...previousState };

        Object.keys(nextState).forEach((key) => {
          if (key.startsWith(`${updatedPlayer.registrationId}-`)) {
            delete nextState[key];
          }
        });

        updatedPlayer.checkedDayKeys.forEach((dayKey) => {
          nextState[`${updatedPlayer.registrationId}-${dayKey}`] = true;
        });

        return nextState;
      });

      setEditingPlayer(null);
      setSelectedEditEventIds(new Set());
    } finally {
      setEditPending(false);
    }
  }

  async function confirmDeletePlayer() {
    if (!deletingPlayer) {
      return;
    }

    setDeletePending(true);

    try {
      const response = await fetch("/api/admin/tournoi/pointages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: deletingPlayer.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du joueur");
      }

      setPlayersState((previousState) =>
        previousState.filter((player) => player.id !== deletingPlayer.id),
      );
      setCheckedState((previousState) => {
        const nextState = { ...previousState };
        Object.keys(nextState).forEach((key) => {
          if (key.startsWith(`${deletingPlayer.id}-`)) {
            delete nextState[key];
          }
        });
        return nextState;
      });
      setDeletingPlayer(null);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4 overflow-x-auto">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Pointage joueurs sur 3 jours</h2>
        <p className="text-sm text-muted-foreground">
          Cochez la présence de chaque joueur par jour pour piloter
          l&apos;accueil rapidement.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rechercher un joueur
          </span>
          <input
            type="search"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nom, prénom ou numéro de licence"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filtrer par club
          </span>
          <select
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            value={selectedClub}
            onChange={(event) => setSelectedClub(event.target.value)}
          >
            <option value="all">Tous les clubs</option>
            {clubOptions.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filtrer par tableau
          </span>
          <select
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            value={selectedTable}
            onChange={(event) => setSelectedTable(event.target.value)}
          >
            <option value="all">Tous les tableaux</option>
            {tableOptions.map((tableOption) => (
              <option key={tableOption.value} value={tableOption.value}>
                {tableOption.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filtrer par pointage
          </span>
          <select
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            value={selectedPointageFilter}
            onChange={(event) => setSelectedPointageFilter(event.target.value)}
          >
            <option value="all">Tous les pointages</option>
            {normalizedDayColumns.map((dayColumn) => (
              <optgroup key={dayColumn.key} label={dayColumn.label}>
                <option value={`unchecked:${dayColumn.key}`}>
                  Non pointés
                </option>
                <option value={`checked:${dayColumn.key}`}>Pointés</option>
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-border  text-foreground">
        <table className="min-w-full text-sm">
          <thead className="bg-sidebar-border">
            <tr className="border-b border-slate-800 text-left text-xs uppercase text-muted-foreground">
              <th className="py-2.5 pl-3 pr-3 font-medium">Joueur</th>
              <th className="py-2.5 pr-3 font-medium">Licence</th>
              <th className="py-2.5 pr-3 font-medium">Club</th>
              <th className="py-2.5 pr-3 font-medium">Tableau(x)</th>
              {normalizedDayColumns.map((dayColumn) => (
                <th key={dayColumn.key} className="py-2.5 pr-3 font-medium">
                  {dayColumn.label}
                </th>
              ))}
              <th className="py-2.5 pr-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr
                key={player.id}
                className="border-b border-slate-800 last:border-0 hover:bg-accent/10"
              >
                <td className="py-3 pl-3 pr-3 font-medium text-foreground">
                  {player.name}
                </td>
                <td className="py-3 pr-3 text-foreground">{player.licence}</td>
                <td className="py-3 pr-3 text-foreground">{player.club}</td>
                <td className="py-3 pr-3 text-foreground">{player.table}</td>
                {normalizedDayColumns.map((dayColumn) => {
                  const key = `${player.id}-${dayColumn.key}`;
                  const hasEventForDay =
                    (player.registrationEventIdsByDay[dayColumn.key] ?? [])
                      .length > 0;
                  return (
                    <td key={key} className="py-3 pr-3 text-foreground">
                      {hasEventForDay ? (
                        <label className="inline-flex items-center gap-2 ">
                          <span className="relative inline-flex h-4 w-4 items-center justify-center">
                            <input
                              type="checkbox"
                              className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-500 bg-background checked:border-transparent align-middle transition  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                              checked={checkedState[key] ?? false}
                              disabled={pendingState[key]}
                              onChange={() =>
                                toggleCheck(player, dayColumn.key)
                              }
                            />
                            <CircleCheckBig
                              size={18}
                              className="pointer-events-none absolute scale-0 transition-transform peer-checked:scale-100 text-primary"
                            />
                          </span>
                          <span className="text-xs ">Présent</span>
                        </label>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Non inscrit
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="py-3 pr-3 ">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="link"
                      size="icon"
                      onClick={() => openEditPopup(player)}
                      title="Éditer le joueur"
                      aria-label={`Éditer ${player.name}`}
                      className="cursor-pointer rounded-full dark:text-sidebar-accent hover:bg-primary/10 focus-visible:outline-accent"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      size="icon"
                      onClick={() => setDeletingPlayer(player)}
                      title="Supprimer le joueur"
                      aria-label={`Supprimer ${player.name}`}
                      className="cursor-pointer rounded-full text-red-600 hover:bg-red-100 focus-visible:outline-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPlayers.length === 0 ? (
              <tr>
                <td
                  colSpan={5 + normalizedDayColumns.length}
                  className="py-6 text-center text-sm text-slate-300"
                >
                  Aucun joueur ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editingPlayer ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl space-y-4 rounded-lg bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">
              Modifier les engagements
            </h3>
            <p className="text-sm text-muted-foreground">
              Modifiez les tableaux de{" "}
              <span className="font-medium">{editingPlayer.name}</span>.
            </p>
            <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              {ineligibleTableCodes.length === 0
                ? "Tous les tableaux sont disponibles pour ce classement."
                : `Tableaux indisponibles pour ce classement : ${ineligibleTableCodes.join(", ")}.`}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto pr-1">
              {tournamentTables.map((table) => {
                const eligible = isEligible(parsedEditingPoints, table);
                const checked = selectedEditEventIds.has(table.id);

                return (
                  <label
                    key={table.id}
                    className={`flex items-start gap-2 rounded-lg border p-3 text-sm transition ${
                      eligible
                        ? "border-border"
                        : "cursor-not-allowed border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    <span className="relative mt-0.5 inline-flex h-4 w-4 items-center justify-center">
                      <input
                        type="checkbox"
                        value={table.id}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-border bg-background align-middle transition checked:border-accent checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!eligible || editPending}
                        checked={checked}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          setSelectedEditEventIds((currentSelection) => {
                            const nextSelection = new Set(currentSelection);
                            if (isChecked) {
                              nextSelection.add(table.id);
                            } else {
                              nextSelection.delete(table.id);
                            }
                            return nextSelection;
                          });
                        }}
                      />
                      <CircleCheckBig className="pointer-events-none absolute h-3 w-3 scale-0 text-muted-foreground transition-transform peer-checked:scale-100" />
                    </span>
                    <span>
                      <span className="block font-semibold text-foreground">
                        Tableau {table.table}
                      </span>
                      <span className="block text-muted-foreground">
                        {table.category}
                      </span>
                      <span className="block text-muted-foreground">
                        Sur place : {table.onsitePayment}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingPlayer(null);
                  setSelectedEditEventIds(new Set());
                }}
                disabled={editPending}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEngagements}
                disabled={editPending}
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                {editPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingPlayer ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg space-y-4 rounded-lg bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">
              Supprimer ce joueur du pointage ?
            </h3>
            <p className="text-sm text-muted-foreground">
              Cette action va supprimer{" "}
              <span className="font-medium">{deletingPlayer.name}</span> ainsi
              que ses engagements en base de données.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                disabled={deletePending}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeletePlayer}
                disabled={deletePending}
                className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
              >
                {deletePending ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
