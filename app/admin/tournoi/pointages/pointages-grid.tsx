"use client";

import { CircleCheckBig, MoreVertical, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type PointagesGridPlayer = {
  id: string;
  licence: string;
  name: string;
  club: string;
  ranking: string;
  table: string;
  status: string;
  payment: string;
  engagedEventIds: string[];
  waitlistEventIds: string[];
  checkedDayKeys: string[];
  registrationEventIdsByDay: Record<string, string[]>;
};

type DayColumn = {
  key: string;
  label: string;
};

type TournamentTable = {
  id: string;
  dayKey: string;
  table: string;
  date: string;
  time: string;
  category: string;
  onsitePayment: string;
  minPoints: number | null;
  maxPoints: number | null;
  maxPlayers: number | null;
  registrations: number;
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
  const [recentlySavedRow, setRecentlySavedRow] = useState<string | null>(null);
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
  const [selectedWaitlistEventIds, setSelectedWaitlistEventIds] = useState<
    Set<string>
  >(new Set());
  const [editPending, setEditPending] = useState<boolean>(false);
  const [openMenuPlayerId, setOpenMenuPlayerId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
        .filter((table) => table && table !== "-"),
    );

    const uniqueTables = Array.from(new Set(extractedTables)).sort(
      (tableA, tableB) => tableA.localeCompare(tableB, "fr"),
    );

    return uniqueTables.map((tableCode) => {
      const matchingTournamentTable = tournamentTables.find(
        (table) => table.table === tableCode,
      );

      if (!matchingTournamentTable) {
        return {
          value: tableCode,
          label: tableCode,
        };
      }

      return {
        value: tableCode,
        label: `${tableCode} - ${matchingTournamentTable.category} (${matchingTournamentTable.date} - ${matchingTournamentTable.time})`,
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

  const dayHeaders = useMemo(() => {
    return normalizedDayColumns.map((dayColumn, index) => {
      const dayTables = tournamentTables.filter(
        (table) => table.dayKey === dayColumn.key,
      );
      const times = dayTables.map((table) => table.time).filter(Boolean);
      const timeRange = (() => {
        if (times.length === 0) {
          return null;
        }
        const sortedTimes = [...times].sort((a, b) => a.localeCompare(b));
        const first = sortedTimes[0];
        const last = sortedTimes[sortedTimes.length - 1];
        if (first === last) {
          return first;
        }
        return `${first}–${last}`;
      })();

      return {
        key: dayColumn.key,
        label: dayColumn.label,
        orderLabel: `Jour ${index + 1}`,
        timeRange,
        tablesCount: dayTables.length,
      };
    });
  }, [normalizedDayColumns, tournamentTables]);


  const hasActiveFilters =
    selectedClub !== "all" ||
    selectedTable !== "all" ||
    selectedPointageFilter !== "all" ||
    searchTerm.trim().length > 0;

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("fr");

    return playersState.filter((player) => {
      const paymentStatus = player.payment?.toLowerCase?.() ?? "";
      const isPaymentPending =
        paymentStatus.includes("partiel") ||
        paymentStatus.includes("régulariser") ||
        paymentStatus.includes("regulariser") ||
        (!paymentStatus.includes("payé") && !paymentStatus.includes("paye"));
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
        (selectedPointageFilter === "waitlist"
          ? player.waitlistEventIds.length > 0
          : false) ||
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

      return (
        matchesClub &&
        matchesTable &&
        matchesPointage &&
        matchesSearch &&
        (paymentDrawerOpen ? isPaymentPending : true)
      );
    });
  }, [
    checkedState,
    playersState,
    searchTerm,
    selectedClub,
    selectedPointageFilter,
    selectedTable,
    paymentDrawerOpen,
  ]);

  useEffect(() => {
    if (quickMode) {
      searchInputRef.current?.focus();
    }
  }, [quickMode]);

  const parsedEditingPoints = useMemo(() => {
    if (
      !editingPlayer ||
      !editingPlayer.ranking.trim() ||
      editingPlayer.ranking === "-"
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

  const fullTableIds = useMemo(() => {
    return new Set(
      tournamentTables
        .filter(
          (table) =>
            table.maxPlayers !== null &&
            table.registrations >= table.maxPlayers,
        )
        .map((table) => table.id),
    );
  }, [tournamentTables]);

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

      setRecentlySavedRow(player.id);
      setTimeout(() => setRecentlySavedRow(null), 2000);
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
    setSelectedWaitlistEventIds(new Set(player.waitlistEventIds));
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
          waitlistEventIds: Array.from(selectedWaitlistEventIds).filter((id) =>
            nextEventIds.includes(id),
          ),
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
          waitlistEventIds: string[];
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
                waitlistEventIds: updatedPlayer.waitlistEventIds,
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
      setSelectedWaitlistEventIds(new Set());
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

  useEffect(() => {
    if (!openMenuPlayerId) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const menuRoot = target.closest(
        `[data-pointage-menu="${openMenuPlayerId}"]`,
      );
      const floatingMenu = target.closest(
        `[data-pointage-menu-floating="${openMenuPlayerId}"]`,
      );
      if (!menuRoot && !floatingMenu) {
        setOpenMenuPlayerId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openMenuPlayerId]);

  function resetFilters() {
    setSelectedClub("all");
    setSelectedTable("all");
    setSelectedPointageFilter("all");
    setSearchTerm("");
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

      <div className="rounded-xl border border-border bg-card/95 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filtres rapides
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPointageFilter("all")}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedPointageFilter === "all"
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setSelectedPointageFilter("waitlist")}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedPointageFilter === "waitlist"
                  ? "border-amber-400/50 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Attente
            </button>
            {dayHeaders.map((dayHeader) => (
              <button
                key={`${dayHeader.key}-unchecked`}
                type="button"
                onClick={() =>
                  setSelectedPointageFilter(`unchecked:${dayHeader.key}`)
                }
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedPointageFilter === `unchecked:${dayHeader.key}`
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {dayHeader.orderLabel} · Non pointés
              </button>
            ))}
            {dayHeaders.map((dayHeader) => (
              <button
                key={`${dayHeader.key}-checked`}
                type="button"
                onClick={() =>
                  setSelectedPointageFilter(`checked:${dayHeader.key}`)
                }
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedPointageFilter === `checked:${dayHeader.key}`
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {dayHeader.orderLabel} · Pointés
              </button>
            ))}
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="whitespace-nowrap rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/60"
            >
              Réinitialiser
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPaymentDrawerOpen((current) => !current)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
              paymentDrawerOpen
                ? "border-amber-400/50 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {paymentDrawerOpen ? "Paiements en attente" : "Filtrer paiements"}
          </button>
          <button
            type="button"
            onClick={() => setQuickMode((current) => !current)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
              quickMode
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {quickMode ? "Mode rapide" : "Pointage rapide"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rechercher un joueur
          </span>
          <input
            type="search"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            ref={searchInputRef}
            placeholder="Nom, prénom ou numéro de licence"
          />
        </label>

        {!quickMode ? (
          <>
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
                <option value="waitlist">En attente</option>
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
          </>
        ) : null}
      </div>

      <div className="overflow-x-auto overflow-y-visible rounded-xl border border-border bg-card shadow-sm text-foreground">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-20 bg-card">
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="sticky left-0 z-20 bg-card py-2.5 pl-3 pr-3 font-medium">
                Joueur
              </th>
              {!quickMode ? (
                <>
                  <th className="py-2.5 pr-3 font-medium">Licence</th>
                  <th className="py-2.5 pr-3 font-medium">Club</th>
                  <th className="py-2.5 pr-3 font-medium">Tableau(x)</th>
                </>
              ) : null}
              <th className="sticky right-24 z-20 bg-card py-2.5 pr-3 font-medium">
                Paiement
              </th>
              {dayHeaders.map((dayHeader) => (
                <th key={dayHeader.key} className="py-2.5 pr-3 font-medium">
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-semibold text-foreground">
                      {dayHeader.orderLabel}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {dayHeader.label}
                    </span>
                    {dayHeader.timeRange ? (
                      <span className="block text-[10px] text-muted-foreground">
                        {dayHeader.timeRange} · {dayHeader.tablesCount} tableaux
                      </span>
                    ) : null}
                  </div>
                </th>
              ))}
              <th className="sticky right-0 z-20 bg-card py-2.5 pl-3 pr-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) =>
              (() => {
                const hasAnyCheck = normalizedDayColumns.some(
                  (dayColumn) =>
                    checkedState[`${player.id}-${dayColumn.key}`] ?? false,
                );
                const paymentStatus = player.payment?.toLowerCase?.() ?? "";
                const paymentBadgeLabel =
                  paymentStatus.includes("partiel") ||
                  paymentStatus.includes("régulariser") ||
                  paymentStatus.includes("regulariser")
                    ? "Partiel"
                    : paymentStatus.includes("payé")
                      ? null
                      : "Attente";
                return (
                  <tr
                    key={player.id}
                    className={`group border-b border-slate-800 last:border-0 hover:bg-accent/10 ${
                      hasAnyCheck ? "bg-muted/20" : ""
                    }`}
                  >
                    <td
                      className={`sticky left-0 z-10 py-3 pl-3 pr-3 font-medium text-foreground ${
                        hasAnyCheck ? "bg-muted/20" : "bg-card"
                      } group-hover:bg-accent/10`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{player.name}</span>
                        {recentlySavedRow === player.id ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                            OK
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {!quickMode ? (
                      <>
                        <td className="py-3 pr-3 text-foreground">
                          {player.licence}
                        </td>
                        <td className="py-3 pr-3 text-foreground">
                          {player.club}
                        </td>
                        <td className="py-3 pr-3 text-foreground">
                          {player.table}
                        </td>
                      </>
                    ) : null}
                    <td className="sticky right-24 z-10 bg-card py-3 pr-3 text-foreground group-hover:bg-accent/10">
                      {paymentStatus.includes("payé") ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          Payé
                        </span>
                      ) : paymentBadgeLabel ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          <span className="text-[10px] leading-none">⦿</span>
                          {paymentBadgeLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                          <span className="text-[10px] leading-none">⦿</span>
                          En attente
                        </span>
                      )}
                    </td>
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
                                  className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-500  checked:border-transparent align-middle transition  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
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
                              {pendingState[key] ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                              ) : null}
                            </label>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Non inscrit
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-card py-3 pl-3 pr-3 group-hover:bg-accent/10">
                      <div
                        className="relative flex items-center justify-end"
                        data-pointage-menu={player.id}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            const rect = (
                              event.currentTarget as HTMLElement
                            ).getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 8,
                              left: rect.right,
                            });
                            setOpenMenuPlayerId((currentId) =>
                              currentId === player.id ? null : player.id,
                            );
                          }}
                          aria-haspopup="menu"
                          aria-expanded={openMenuPlayerId === player.id}
                          aria-label={`Actions pour ${player.name}`}
                          className="rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })(),
            )}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditingPlayer(null);
              setSelectedEditEventIds(new Set());
            }
          }}
        >
          <div className="w-full max-w-2xl space-y-4 rounded-lg bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">
                Modifier les engagements
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingPlayer(null);
                  setSelectedEditEventIds(new Set());
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm text-muted-foreground transition-colors hover:bg-muted/50 dark:hover:bg-muted/40"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Modifiez les tableaux de{" "}
              <span className="font-medium">{editingPlayer.name}</span>.
            </p>
            <p className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
              {ineligibleTableCodes.length === 0
                ? "Tous les tableaux sont disponibles pour ce classement."
                : `Tableaux indisponibles pour ce classement : ${ineligibleTableCodes.join(", ")}.`}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[70vh] overflow-y-auto pr-1">
              {tournamentTables.map((table) => {
                const eligible = isEligible(parsedEditingPoints, table);
                const checked = selectedEditEventIds.has(table.id);
                const waitlisted = selectedWaitlistEventIds.has(table.id);
                const isFull = fullTableIds.has(table.id);

                return (
                  <label
                    key={table.id}
                    className={`flex items-start gap-2 rounded-lg border p-3 text-sm transition ${
                      eligible
                        ? "border-border"
                        : "cursor-not-allowed border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="relative mt-0.5 inline-flex h-4 w-4 items-center justify-center">
                      <input
                        type="checkbox"
                        value={table.id}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-border bg-background align-middle transition checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
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
                          if (!isChecked) {
                            setSelectedWaitlistEventIds((currentSelection) => {
                              const nextSelection = new Set(currentSelection);
                              nextSelection.delete(table.id);
                              return nextSelection;
                            });
                          }
                        }}
                      />
                      <CircleCheckBig className="pointer-events-none absolute h-3 w-3 scale-0 text-primary-foreground transition-transform peer-checked:scale-100" />
                    </span>
                    <span>
                      <span
                        className={`block font-semibold ${eligible ? "text-foreground" : "line-through"}`}
                      >
                        Tableau {table.table}
                      </span>
                      <span
                        className={`block text-muted-foreground ${eligible ? "" : "line-through"}`}
                      >
                        {table.category}
                      </span>
                      <span
                        className={`block text-muted-foreground ${eligible ? "" : "line-through"}`}
                      >
                        Sur place : {table.onsitePayment}
                      </span>
                      <label className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          disabled={
                            !checked || editPending || (isFull && waitlisted)
                          }
                          checked={waitlisted}
                          onChange={(event) => {
                            const isWaitlisted = event.target.checked;
                            setSelectedWaitlistEventIds((currentSelection) => {
                              const nextSelection = new Set(currentSelection);
                              if (isWaitlisted) {
                                nextSelection.add(table.id);
                              } else {
                                nextSelection.delete(table.id);
                              }
                              return nextSelection;
                            });
                          }}
                        />
                        Conserver en liste d&apos;attente
                        {isFull ? (
                          <span className="text-[10px] text-muted-foreground">
                            (tableau complet)
                          </span>
                        ) : null}
                      </label>
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
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEngagements}
                disabled={editPending}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 dark:hover:bg-muted/40"
              >
                {editPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingPlayer ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
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

      {openMenuPlayerId && menuPosition ? (
        <div
          className="fixed z-50 w-44 rounded-md border border-border bg-card p-1 text-sm shadow-xl"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            transform: "translateX(-100%)",
          }}
          data-pointage-menu-floating={openMenuPlayerId}
          role="menu"
        >
          <a
            href="/admin/tournoi/paiement"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-foreground transition hover:bg-muted/60"
            onClick={() => setOpenMenuPlayerId(null)}
          >
            Ouvrir paiement
          </a>
          <button
            type="button"
            onClick={() => {
              const player = playersState.find(
                (item) => item.id === openMenuPlayerId,
              );
              if (player) {
                openEditPopup(player);
              }
              setOpenMenuPlayerId(null);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-foreground transition hover:bg-muted/60"
            role="menuitem"
          >
            Éditer
          </button>
          <button
            type="button"
            onClick={() => {
              const player = playersState.find(
                (item) => item.id === openMenuPlayerId,
              );
              if (player) {
                setDeletingPlayer(player);
              }
              setOpenMenuPlayerId(null);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-destructive transition hover:bg-destructive/10"
            role="menuitem"
          >
            Supprimer
          </button>
        </div>
      ) : null}

    </section>
  );
}
