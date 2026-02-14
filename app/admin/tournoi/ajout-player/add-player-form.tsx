"use client";

import { useMemo, useState } from "react";

type TournamentTable = {
  id: string;
  table: string;
  category: string;
  onsitePayment: string;
  minPoints: number | null;
  maxPoints: number | null;
};

type Props = {
  tournamentId: string;
  tournamentTables: TournamentTable[];
  action: (formData: FormData) => void;
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

export function AddPlayerForm({ tournamentId, tournamentTables, action }: Props) {
  const [pointsInput, setPointsInput] = useState("");
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());

  const parsedPoints = useMemo(() => {
    if (!pointsInput.trim()) {
      return null;
    }

    const numericPoints = Number.parseInt(pointsInput, 10);
    return Number.isNaN(numericPoints) ? null : numericPoints;
  }, [pointsInput]);

  const ineligibleTableCodes = useMemo(
    () => tournamentTables.filter((table) => !isEligible(parsedPoints, table)).map((table) => table.table),
    [parsedPoints, tournamentTables],
  );

  const infoMessage = useMemo(() => {
    if (!pointsInput.trim()) {
      return "Renseignez le classement pour filtrer automatiquement les tableaux disponibles.";
    }

    if (parsedPoints === null || parsedPoints < 0) {
      return "Classement invalide : veuillez saisir un nombre positif.";
    }

    if (ineligibleTableCodes.length === 0) {
      return "Tous les tableaux sont disponibles pour ce classement.";
    }

    return `Tableaux indisponibles pour ce classement : ${ineligibleTableCodes.join(", ")}.`;
  }, [ineligibleTableCodes, parsedPoints, pointsInput]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="tournamentId" value={tournamentId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Nom *</span>
          <input
            name="nom"
            required
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Prénom *</span>
          <input
            name="prenom"
            required
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Licence *</span>
          <input
            name="licence"
            required
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Classement (points) *</span>
          <input
            name="points"
            type="number"
            min={0}
            required
            value={pointsInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              setPointsInput(nextValue);

              const nextPoints = Number.parseInt(nextValue, 10);
              if (nextValue.trim() && !Number.isNaN(nextPoints)) {
                setSelectedEventIds((currentSelection) => {
                  const updatedSelection = new Set<string>();
                  for (const table of tournamentTables) {
                    if (currentSelection.has(table.id) && isEligible(nextPoints, table)) {
                      updatedSelection.add(table.id);
                    }
                  }
                  return updatedSelection;
                });
              }
            }}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Club *</span>
          <input
            name="club"
            required
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Email *</span>
          <input
            name="contactEmail"
            type="email"
            required
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium text-muted-foreground">Téléphone *</span>
          <input
            name="contactPhone"
            required
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Tableaux à inscrire *</p>
          <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">{infoMessage}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tournamentTables.map((table) => {
            const eligible = isEligible(parsedPoints, table);
            const checked = selectedEventIds.has(table.id);

            return (
              <label
                key={table.id}
                className={`flex items-start gap-2 rounded-lg border p-3 text-sm transition ${
                  eligible
                    ? "border-border"
                    : "cursor-not-allowed border-border bg-secondary text-muted-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  name="eventIds"
                  value={table.id}
                  className="mt-0.5"
                  disabled={!eligible}
                  checked={checked}
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    setSelectedEventIds((currentSelection) => {
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
                <span>
                  <span className="block font-semibold text-foreground">Tableau {table.table}</span>
                  <span className="block text-muted-foreground">{table.category}</span>
                  <span className="block text-muted-foreground">Sur place : {table.onsitePayment}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <label className="space-y-1 text-sm block">
        <span className="font-medium text-muted-foreground">Notes internes</span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </label>

      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-[#ff00c8] px-4 py-2 text-sm font-medium text-white hover:bg-[#ff00c8]/90"
      >
        Ajouter le joueur
      </button>
    </form>
  );
}
