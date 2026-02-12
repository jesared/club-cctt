"use client";

import { useMemo, useState } from "react";

type PointagesGridPlayer = {
  licence: string;
  name: string;
  club: string;
  table: string;
  status: string;
};

type PointagesGridProps = {
  players: PointagesGridPlayer[];
  dayLabels: string[];
};

export function PointagesGrid({ players, dayLabels }: PointagesGridProps) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  const normalizedDayLabels = useMemo(() => {
    if (dayLabels.length >= 3) {
      return dayLabels.slice(0, 3);
    }

    return Array.from({ length: 3 }, (_, index) => dayLabels[index] ?? `Jour ${index + 1}`);
  }, [dayLabels]);

  function toggleCheck(licence: string, dayLabel: string) {
    const key = `${licence}-${dayLabel}`;
    setCheckedState((previousState) => ({
      ...previousState,
      [key]: !previousState[key],
    }));
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4 overflow-x-auto">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Pointage joueurs sur 3 jours</h2>
        <p className="text-sm text-gray-600">
          Cochez la présence de chaque joueur par jour pour piloter l&apos;accueil rapidement.
        </p>
      </header>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-3 font-medium">Joueur</th>
            <th className="py-2 pr-3 font-medium">Club</th>
            <th className="py-2 pr-3 font-medium">Tableau(x)</th>
            {normalizedDayLabels.map((dayLabel) => (
              <th key={dayLabel} className="py-2 pr-3 font-medium">{dayLabel}</th>
            ))}
            <th className="py-2 font-medium">Statut inscription</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.licence} className="border-b last:border-0">
              <td className="py-3 pr-3 text-gray-900 font-medium">{player.name}</td>
              <td className="py-3 pr-3 text-gray-700">{player.club}</td>
              <td className="py-3 pr-3 text-gray-700">{player.table}</td>
              {normalizedDayLabels.map((dayLabel) => {
                const key = `${player.licence}-${dayLabel}`;
                return (
                  <td key={key} className="py-3 pr-3 text-gray-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={checkedState[key] ?? false}
                        onChange={() => toggleCheck(player.licence, dayLabel)}
                      />
                      <span className="text-xs text-gray-500">Présent</span>
                    </label>
                  </td>
                );
              })}
              <td className="py-3 text-gray-700">{player.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
