"use client";

import Link from "next/link";
import {
  CircleAlert,
  CircleCheckBig,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  Undo2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlayerSearchTerms, scorePlayerSearch } from "../player-search";

type PointagesGridPlayer = {
  id: string;
  paymentGroupKey: string;
  licence: string;
  name: string;
  club: string;
  ranking: string;
  table: string;
  status: string;
  payment: string;
  fullyRefunded: boolean;
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
  initialSearchTerm?: string;
  initialDay?: string;
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

function getPaymentMeta({ payment, fullyRefunded }: PointagesGridPlayer) {
  if (fullyRefunded) {
    return {
      label: "Remboursé",
      isPending: false,
      className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
    };
  }

  const paymentStatus = payment?.toLowerCase?.() ?? "";

  if (
    paymentStatus.includes("partiel") ||
    paymentStatus.includes("régulariser") ||
    paymentStatus.includes("regulariser")
  ) {
    return {
      label: "Partiel",
      isPending: true,
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    };
  }

  if (paymentStatus.includes("payé") || paymentStatus.includes("paye")) {
    return {
      label: "Réglé",
      isPending: false,
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    };
  }

  return {
    label: "À régler",
    isPending: true,
    className:
      "bg-slate-100 text-red-700 dark:bg-slate-800/60 dark:text-red-200",
  };
}

export function PointagesGrid({
  players,
  dayColumns,
  tournamentTables,
  initialSearchTerm = "",
  initialDay = "all",
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
  const [checkError, setCheckError] = useState<string | null>(null);
  const [recentlySavedRow, setRecentlySavedRow] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [presence, setPresence] = useState("all");
  const [waitlistOnly, setWaitlistOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
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
  const [statsCompact, setStatsCompact] = useState(true);
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

  const advancedFilterCount = Number(selectedClub !== "all") +
    Number(selectedTable !== "all") + Number(waitlistOnly) + Number(paymentDrawerOpen);
  const hasActiveFilters = advancedFilterCount > 0 ||
    selectedDay !== "all" || presence !== "all" || searchTerm.trim().length > 0;

  const filteredPlayers = useMemo(() => {
    const terms = getPlayerSearchTerms(searchTerm);

    const eligiblePlayers = playersState.filter((player) => {
      const isPaymentPending = getPaymentMeta(player).isPending;
      const matchesClub =
        selectedClub === "all" || player.club === selectedClub;
      const playerTables = player.table
        .split(",")
        .map((table) => table.trim())
        .filter(Boolean);
      const matchesTable =
        selectedTable === "all" || playerTables.includes(selectedTable);
      const matchesPointage = selectedDay === "all" && presence === "all" ||
        normalizedDayColumns.some(({ key }) => {
          if (selectedDay !== "all" && selectedDay !== key) return false;
          if (!player.registrationEventIdsByDay[key]?.length) return false;
          const checked = checkedState[`${player.id}-${key}`] ?? false;
          return presence === "all" || checked === (presence === "checked");
        });

      return matchesClub && matchesTable && matchesPointage &&
        (!waitlistOnly || player.waitlistEventIds.length > 0) &&
        (!paymentDrawerOpen || isPaymentPending);
    });

    if (terms.length === 0) return eligiblePlayers;

    return eligiblePlayers
      .flatMap((player) => {
        const score = scorePlayerSearch(terms, player);
        return score === null ? [] : [{ player, score }];
      })
      .sort((a, b) => b.score - a.score)
      .map(({ player }) => player);
  }, [
    checkedState,
    playersState,
    searchTerm,
    selectedClub,
    selectedDay,
    presence,
    waitlistOnly,
    normalizedDayColumns,
    selectedTable,
    paymentDrawerOpen,
  ]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

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

  async function saveCheck(player: PointagesGridPlayer, dayKey: string, checked: boolean) {
    const key = `${player.id}-${dayKey}`;
    const eventIds = player.registrationEventIdsByDay[dayKey] ?? [];

    if (eventIds.length === 0 || pendingState[key]) {
      return;
    }

    setCheckError(null);
    setPendingState((previousState) => ({ ...previousState, [key]: true }));

    try {
      const response = await fetch("/api/admin/tournoi/pointages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationEventIds: eventIds,
          checked: checked,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du pointage");
      }

      setCheckedState((previousState) => ({ ...previousState, [key]: checked }));
      setRecentlySavedRow(player.id);
      setTimeout(() => setRecentlySavedRow(null), 2000);
    } catch {
      setCheckError(`Le pointage de ${player.name} n’a pas été enregistré. Réessayez.`);
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
          payment: PointagesGridPlayer["payment"];
          fullyRefunded: boolean;
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
                payment: updatedPlayer.payment,
                fullyRefunded: updatedPlayer.fullyRefunded,
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
    setSelectedDay("all");
    setPresence("all");
    setWaitlistOnly(false);
    setPaymentDrawerOpen(false);
    setSearchTerm("");
  }

  const daySummaries = useMemo(() => {
    return normalizedDayColumns.map((dayColumn, index) => {
      const registeredPlayers = filteredPlayers.filter(
        (player) =>
          (player.registrationEventIdsByDay[dayColumn.key] ?? []).length > 0,
      );
      const checkedCount = registeredPlayers.filter(
        (player) => checkedState[`${player.id}-${dayColumn.key}`] ?? false,
      ).length;

      return {
        ...dayHeaders[index],
        registeredCount: registeredPlayers.length,
        checkedCount,
        uncheckedCount: registeredPlayers.length - checkedCount,
      };
    });
  }, [checkedState, dayHeaders, filteredPlayers, normalizedDayColumns]);

  const playersWithAnyCheck = useMemo(() => {
    return filteredPlayers.filter((player) =>
      normalizedDayColumns.some(
        (dayColumn) => checkedState[`${player.id}-${dayColumn.key}`] ?? false,
      ),
    ).length;
  }, [checkedState, filteredPlayers, normalizedDayColumns]);

  const pendingPaymentsCount = useMemo(() => {
    return filteredPlayers.filter(
      (player) => getPaymentMeta(player).isPending,
    ).length;
  }, [filteredPlayers]);

  const waitlistCount = useMemo(() => {
    return filteredPlayers.filter(
      (player) => player.waitlistEventIds.length > 0,
    ).length;
  }, [filteredPlayers]);

  const visibleDays = selectedDay === "all"
    ? dayHeaders
    : dayHeaders.filter((day) => day.key === selectedDay);
  const expectedToday = selectedDay === "all"
    ? []
    : playersState.filter((player) => player.registrationEventIdsByDay[selectedDay]?.length);
  const checkedToday = expectedToday.filter((player) => checkedState[`${player.id}-${selectedDay}`]).length;
  const tableColumnCount = 3 + visibleDays.length;
  const openMenuPlayer = openMenuPlayerId
    ? (playersState.find((player) => player.id === openMenuPlayerId) ?? null)
    : null;
  const checkedMenuDays = openMenuPlayer
    ? dayHeaders.filter((day) => checkedState[`${openMenuPlayer.id}-${day.key}`])
    : [];

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Pointage des joueurs</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="hover:bg-muted hover:text-foreground" aria-expanded={!statsCompact}
            onClick={() => setStatsCompact((current) => !current)}>
            {statsCompact ? "Afficher les stats" : "Masquer les stats"}
          </Button>
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 grow basis-56">
            <span className="sr-only">Rechercher un joueur</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              className="admin-input pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              ref={searchInputRef}
              placeholder="Nom, licence ou club"
            />
          </label>
          <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {selectedDay !== "all" ? (
              <span className="whitespace-nowrap font-medium text-foreground">
                {checkedToday} pointé{checkedToday > 1 ? "s" : ""} sur {expectedToday.length} attendu{expectedToday.length > 1 ? "s" : ""}
              </span>
            ) : null}
            {searchTerm.trim() ? (
              <span>{filteredPlayers.length} résultat{filteredPlayers.length > 1 ? "s" : ""}</span>
            ) : selectedDay === "all" ? (
              <span>{filteredPlayers.length} / {playersState.length} joueurs</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="grid min-w-32 flex-1 gap-1 text-xs font-medium sm:flex-none">
            Jour
            <select className="admin-select" value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}>
              <option value="all">Tous les jours</option>
              {dayHeaders.map((day) => (
                <option key={day.key} value={day.key}>{day.orderLabel} · {day.label}</option>
              ))}
            </select>
          </label>
          <label className="grid min-w-32 flex-1 gap-1 text-xs font-medium sm:flex-none">
            Présence
            <select className="admin-select" value={presence}
              onChange={(event) => setPresence(event.target.value)}>
              <option value="all">Tous les pointages</option>
              <option value="unchecked">Non pointés</option>
              <option value="checked">Pointés</option>
            </select>
          </label>
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" className="hover:bg-muted hover:text-foreground" onClick={resetFilters}>Réinitialiser</Button>
          ) : null}
        </div>

        <details className="rounded-lg border border-border/70">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
            Plus de filtres{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}
          </summary>
          <div className="grid gap-3 border-t border-border/70 p-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium">
              Club
              <select className="admin-select" value={selectedClub}
                onChange={(event) => setSelectedClub(event.target.value)}>
                <option value="all">Tous les clubs</option>
                {clubOptions.map((club) => <option key={club} value={club}>{club}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Tableau
              <select className="admin-select" value={selectedTable}
                onChange={(event) => setSelectedTable(event.target.value)}>
                <option value="all">Tous les tableaux</option>
                {tableOptions.map((table) => <option key={table.value} value={table.value}>{table.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={waitlistOnly}
                onChange={(event) => setWaitlistOnly(event.target.checked)} />
              Liste d’attente
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={paymentDrawerOpen}
                onChange={(event) => setPaymentDrawerOpen(event.target.checked)} />
              Paiements en attente
            </label>
          </div>
        </details>
      </div>

      {!statsCompact ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Joueurs affichés
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-foreground",
                      "mt-2 text-3xl",
                    )}
                  >
                    {filteredPlayers.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    sur {playersState.length} inscriptions actuellement chargées
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Users className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paiements à traiter
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-foreground",
                      "mt-2 text-3xl",
                    )}
                  >
                    {pendingPaymentsCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    joueurs avec paiement partiel ou en attente
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 p-2 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  <Wallet className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Déjà pointés
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-foreground",
                      "mt-2 text-3xl",
                    )}
                  >
                    {playersWithAnyCheck}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    joueurs validés sur au moins une journée
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <CircleCheckBig className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Liste d&apos;attente
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-foreground",
                      "mt-2 text-3xl",
                    )}
                  >
                    {waitlistCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    joueurs ayant encore un engagement en attente
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  <CircleAlert className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {daySummaries.map((daySummary) => (
              <div
                key={daySummary.key}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {daySummary.orderLabel}
                    </p>
                    <h3
                      className={cn(
                        "font-semibold text-foreground",
                        "mt-1 text-sm",
                      )}
                    >
                      {daySummary.label}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {daySummary.timeRange
                        ? `${daySummary.timeRange} · ${daySummary.tablesCount} tableaux`
                        : `${daySummary.tablesCount} tableaux`}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {daySummary.checkedCount}/{daySummary.registeredCount}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width:
                          daySummary.registeredCount === 0
                            ? "0%"
                            : `${(daySummary.checkedCount / daySummary.registeredCount) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{daySummary.checkedCount} pointés</span>
                    <span>{daySummary.uncheckedCount} à accueillir</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {checkError ? (
        <p role="alert" className="text-sm text-destructive">{checkError}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm text-foreground">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-20 bg-card">
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="sticky left-0 z-20 bg-card py-3 pl-4 pr-3 font-medium">
                  Joueur
                </th>
                <th className="sticky text-center right-24 z-20 bg-card py-3 pr-3 font-medium">
                  Paiement
                </th>
                {visibleDays.map((dayHeader) => (
                  <th key={dayHeader.key} className={cn("py-3 pr-3 font-medium", selectedDay !== "all" && "w-1/4")}>
                    <div className="space-y-0.5">
                      <span className="block text-[11px] font-semibold text-foreground">
                        {dayHeader.orderLabel}
                      </span>
                      {selectedDay !== "all" ? <span className="normal-case tracking-normal">{dayHeader.label}</span> : null}
                    </div>
                  </th>
                ))}
                <th className="sticky text-center right-0 z-20 bg-card py-3 pl-3 pr-4 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) =>
                (() => {
                  const paymentMeta = getPaymentMeta(player);

                  return (
                    <tr
                      key={player.id}
                      className="group border-b border-border/60 last:border-0 hover:bg-muted/40"
                    >
                      <td
                        className={`sticky left-0 z-10 py-3 pl-4 pr-3 font-medium text-foreground`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{player.name}</span>
                            {recentlySavedRow === player.id ? (
                              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                OK
                              </span>
                            ) : null}
                            {player.waitlistEventIds.length > 0 ? (
                              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                Attente
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs font-normal text-muted-foreground">
                            {player.club} · {player.licence} ·{" "}
                            {player.table || "Sans tableau"}
                          </p>
                        </div>
                      </td>
                      <td
                        className={`sticky text-center right-24 z-10 py-3 pr-3 text-foreground`}
                      >
                        <Link
                          href={`/admin/tournoi/paiement?dossier=${encodeURIComponent(player.paymentGroupKey)}`}
                          aria-label={`${paymentMeta.label} · Ouvrir le dossier de paiement de ${player.name}`}
                          title="Ouvrir le dossier de paiement"
                          className={cn(
                            "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            paymentMeta.className,
                          )}
                        >
                          {paymentMeta.label}
                        </Link>
                      </td>
                      {visibleDays.map((dayColumn) => {
                        const key = `${player.id}-${dayColumn.key}`;
                        const hasEventForDay =
                          (
                            player.registrationEventIdsByDay[dayColumn.key] ??
                            []
                          ).length > 0;
                        return (
                          <td key={key} className="py-3 pr-3 text-foreground">
                            {hasEventForDay ? (
                              pendingState[key] ? (
                                <span role="status" className="whitespace-nowrap text-xs text-muted-foreground">En cours…</span>
                              ) : checkedState[key] ? (
                                <span className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-500/40 px-3 font-medium text-emerald-700 dark:text-emerald-300">
                                  <CircleCheckBig aria-hidden="true" className="h-4 w-4" />
                                  Présent
                                </span>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={selectedDay === "all" ? "secondary" : "default"}
                                  className="min-w-20 whitespace-nowrap"
                                  aria-label={`Pointer · ${player.name} · ${dayColumn.orderLabel}`}
                                  onClick={() => saveCheck(player, dayColumn.key, true)}
                                >
                                  Pointer
                                </Button>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Non inscrit
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className={`sticky right-0 z-10 py-3 pl-3 pr-4`}>
                        <div
                          className="relative flex items-center justify-center"
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
                                top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 360)),
                                left: rect.right,
                              });
                              setOpenMenuPlayerId((currentId) =>
                                currentId === player.id ? null : player.id,
                              );
                            }}
                            aria-haspopup="menu"
                            aria-expanded={openMenuPlayerId === player.id}
                            aria-label={`Actions pour ${player.name}`}
                            className="rounded-full hover:bg-muted hover:text-foreground"
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
                    colSpan={tableColumnCount}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucun joueur ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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

      {openMenuPlayer && menuPosition ? (
        <div
          className="fixed z-50 w-64 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-border bg-card p-1.5 text-sm shadow-xl"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            transform: "translateX(-100%)",
            maxHeight: `calc(100dvh - ${menuPosition.top + 8}px)`,
          }}
          data-pointage-menu-floating={openMenuPlayerId}
          role="menu"
          aria-label={`Actions pour ${openMenuPlayer.name}`}
        >
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">{openMenuPlayer.name}</p>
          <a
            href={`/admin/tournoi/paiement?dossier=${encodeURIComponent(openMenuPlayer.paymentGroupKey)}`}
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-foreground transition hover:bg-muted/60"
            onClick={() => setOpenMenuPlayerId(null)}
          >
            <Wallet aria-hidden="true" className="h-4 w-4 shrink-0" />
            Ouvrir le paiement
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
            <Pencil aria-hidden="true" className="h-4 w-4 shrink-0" />
            Modifier l’inscription
          </button>
          {checkedMenuDays.length > 0 ? (
            <div role="group" aria-label="Pointages enregistrés" className="my-1 border-t border-border pt-1">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground">Pointages enregistrés</p>
              {checkedMenuDays.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  role="menuitem"
                  disabled={pendingState[`${openMenuPlayer.id}-${day.key}`]}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-foreground hover:bg-muted/60 disabled:opacity-50"
                  onClick={() => {
                    setOpenMenuPlayerId(null);
                    void saveCheck(openMenuPlayer, day.key, false);
                  }}
                >
                  <Undo2 aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="block font-medium">Annuler le pointage</span>
                    <span className="block text-xs text-muted-foreground">{day.orderLabel} · {day.label}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          <div role="separator" className="my-1 border-t border-border" />
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
            <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
            Supprimer l’inscription
          </button>
        </div>
      ) : null}
    </section>
  );
}
