"use client";

import { useMemo, useState } from "react";

type PointagesGridPlayer = {
  id: string;
  licence: string;
  name: string;
  club: string;
  table: string;
  status: string;
  checkedDayKeys: string[];
  registrationEventIdsByDay: Record<string, string[]>;
};

type DayColumn = {
  key: string;
  label: string;
};

type PointagesGridProps = {
  players: PointagesGridPlayer[];
  dayColumns: DayColumn[];
};

export function PointagesGrid({ players, dayColumns }: PointagesGridProps) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() => {
    return players.reduce<Record<string, boolean>>((acc, player) => {
      player.checkedDayKeys.forEach((dayKey) => {
        acc[`${player.id}-${dayKey}`] = true;
      });
      return acc;
    }, {});
  });
  const [pendingState, setPendingState] = useState<Record<string, boolean>>({});
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<string>("all");

  const clubOptions = useMemo(() => {
    return Array.from(new Set(players.map((player) => player.club))).sort((clubA, clubB) =>
      clubA.localeCompare(clubB, "fr"),
    );
  }, [players]);

  const tableOptions = useMemo(() => {
    const extractedTables = players.flatMap((player) =>
      player.table
        .split(",")
        .map((table) => table.trim())
        .filter((table) => table && table !== "—"),
    );

    return Array.from(new Set(extractedTables)).sort((tableA, tableB) =>
      tableA.localeCompare(tableB, "fr"),
    );
  }, [players]);

  const normalizedDayColumns = useMemo(() => {
    if (dayColumns.length >= 3) {
      return dayColumns.slice(0, 3);
    }

    return Array.from({ length: 3 }, (_, index) => dayColumns[index] ?? { key: `day-${index + 1}`, label: `Jour ${index + 1}` });
  }, [dayColumns]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesClub = selectedClub === "all" || player.club === selectedClub;
      const playerTables = player.table
        .split(",")
        .map((table) => table.trim())
        .filter(Boolean);
      const matchesTable = selectedTable === "all" || playerTables.includes(selectedTable);

      return matchesClub && matchesTable;
    });
  }, [players, selectedClub, selectedTable]);

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

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4 overflow-x-auto">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Pointage joueurs sur 3 jours</h2>
        <p className="text-sm text-gray-600">
          Cochez la présence de chaque joueur par jour pour piloter l&apos;accueil rapidement.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Filtrer par club</span>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
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
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Filtrer par tableau</span>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
            value={selectedTable}
            onChange={(event) => setSelectedTable(event.target.value)}
          >
            <option value="all">Tous les tableaux</option>
            {tableOptions.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-3 font-medium">Joueur</th>
            <th className="py-2 pr-3 font-medium">Club</th>
            <th className="py-2 pr-3 font-medium">Tableau(x)</th>
            {normalizedDayColumns.map((dayColumn) => (
              <th key={dayColumn.key} className="py-2 pr-3 font-medium">{dayColumn.label}</th>
            ))}
            <th className="py-2 font-medium">Statut inscription</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => (
            <tr key={player.id} className="border-b last:border-0">
              <td className="py-3 pr-3 text-gray-900 font-medium">{player.name}</td>
              <td className="py-3 pr-3 text-gray-700">{player.club}</td>
              <td className="py-3 pr-3 text-gray-700">{player.table}</td>
              {normalizedDayColumns.map((dayColumn) => {
                const key = `${player.id}-${dayColumn.key}`;
                const hasEventForDay = (player.registrationEventIdsByDay[dayColumn.key] ?? []).length > 0;
                return (
                  <td key={key} className="py-3 pr-3 text-gray-700">
                    {hasEventForDay ? (
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={checkedState[key] ?? false}
                          disabled={pendingState[key]}
                          onChange={() => toggleCheck(player, dayColumn.key)}
                        />
                        <span className="text-xs text-gray-500">Présent</span>
                      </label>
                    ) : (
                      <span className="text-xs text-gray-400">Non inscrit</span>
                    )}
                  </td>
                );
              })}
              <td className="py-3 text-gray-700">{player.status}</td>
            </tr>
          ))}
          {filteredPlayers.length === 0 ? (
            <tr>
              <td colSpan={6 + normalizedDayColumns.length} className="py-6 text-center text-sm text-gray-500">
                Aucun joueur ne correspond aux filtres sélectionnés.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
