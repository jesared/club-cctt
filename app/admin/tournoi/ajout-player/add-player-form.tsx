"use client";

import { useMemo, useState } from "react";

type TournamentTable = {
  id: string;
  dayKey: string;
  date: string;
  time: string;
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
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    licence: "",
    points: "",
    club: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    eventIds: [] as string[],
  });

  const parsedPoints = useMemo(() => {
    if (!formData.points.trim()) {
      return null;
    }

    const numericPoints = Number.parseInt(formData.points, 10);
    return Number.isNaN(numericPoints) ? null : numericPoints;
  }, [formData.points]);

  const groupedTournamentTables = useMemo(() => {
    const groups = new Map<string, { date: string; tables: TournamentTable[] }>();

    for (const table of tournamentTables) {
      const existingGroup = groups.get(table.dayKey);
      if (existingGroup) {
        existingGroup.tables.push(table);
      } else {
        groups.set(table.dayKey, { date: table.date, tables: [table] });
      }
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dayKey, group]) => ({
        dayKey,
        date: group.date,
        tables: group.tables,
      }));
  }, [tournamentTables]);

  const ineligibleTableCodes = useMemo(
    () => tournamentTables.filter((table) => !isEligible(parsedPoints, table)).map((table) => table.table),
    [parsedPoints, tournamentTables],
  );

  const infoMessage = useMemo(() => {
    if (!formData.points.trim()) {
      return "Renseignez le classement pour filtrer automatiquement les tableaux disponibles.";
    }

    if (parsedPoints === null || parsedPoints < 0) {
      return "Classement invalide : veuillez saisir un nombre positif.";
    }

    if (ineligibleTableCodes.length === 0) {
      return "Tous les tableaux sont disponibles pour ce classement.";
    }

    return `Tableaux indisponibles pour ce classement : ${ineligibleTableCodes.join(", ")}.`;
  }, [formData.points, ineligibleTableCodes, parsedPoints]);

  const canSubmit = formData.eventIds.length > 0;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="tournamentId" value={tournamentId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Nom *</span>
          <input
            name="nom"
            required
            value={formData.nom}
            onChange={(event) => setFormData((current) => ({ ...current, nom: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="DUPONT"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Prénom *</span>
          <input
            name="prenom"
            required
            value={formData.prenom}
            onChange={(event) => setFormData((current) => ({ ...current, prenom: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Jean"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Licence *</span>
          <input
            name="licence"
            required
            value={formData.licence}
            onChange={(event) => setFormData((current) => ({ ...current, licence: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="1234567"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Classement (points) *</span>
          <input
            name="points"
            type="number"
            min={0}
            required
            value={formData.points}
            onChange={(event) => {
              const nextValue = event.target.value;
              setFormData((current) => {
                const nextPoints = Number.parseInt(nextValue, 10);

                if (!nextValue.trim() || Number.isNaN(nextPoints)) {
                  return { ...current, points: nextValue };
                }

                const nextEventIds: string[] = [];

                for (const table of tournamentTables) {
                  if (current.eventIds.includes(table.id) && isEligible(nextPoints, table)) {
                    nextEventIds.push(table.id);
                  }
                }

                return {
                  ...current,
                  points: nextValue,
                  eventIds: nextEventIds,
                };
              });
            }}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="1248"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Club *</span>
          <input
            name="club"
            required
            value={formData.club}
            onChange={(event) => setFormData((current) => ({ ...current, club: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Nom du club"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Email *</span>
          <input
            name="contactEmail"
            type="email"
            required
            value={formData.contactEmail}
            onChange={(event) => setFormData((current) => ({ ...current, contactEmail: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="joueur@email.fr"
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Téléphone *</span>
          <input
            name="contactPhone"
            required
            value={formData.contactPhone}
            onChange={(event) => setFormData((current) => ({ ...current, contactPhone: event.target.value }))}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="06 12 34 56 78"
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tableaux à inscrire *</legend>
        <p className="text-sm text-muted-foreground">Sélectionnez un ou plusieurs tableaux compatibles avec le classement saisi.</p>
        <p className="rounded-md border border-border bg-accent/25 px-3 py-2 text-xs text-foreground/80">{infoMessage}</p>
        <div className="space-y-4">
          {groupedTournamentTables.map((group) => (
            <div key={group.dayKey} className="space-y-2">
              <p className="text-sm font-semibold capitalize">{group.date}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.tables.map((table) => {
                  const eligible = isEligible(parsedPoints, table);

                  return (
                    <label
                      key={table.id}
                      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                        eligible
                          ? "border-border"
                          : "cursor-not-allowed border-border bg-muted/90 text-muted-foreground line-through"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="eventIds"
                        value={table.id}
                        checked={formData.eventIds.includes(table.id)}
                        disabled={!eligible}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          setFormData((current) => {
                            const nextEventIds = isChecked
                              ? [...current.eventIds, table.id]
                              : current.eventIds.filter((eventId) => eventId !== table.id);

                            return {
                              ...current,
                              eventIds: nextEventIds,
                            };
                          });
                        }}
                        className="mt-1 accent-primary"
                      />
                      <span>
                        <span className="block font-semibold text-foreground">Tableau {table.table}</span>
                        <span className="block text-muted-foreground">{table.category}</span>
                        <span className="block text-muted-foreground">{table.time} · Sur place : {table.onsitePayment}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <label className="space-y-1 text-sm block">
        <span className="font-medium">Notes internes</span>
        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
          className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Informations complémentaires (paiement, disponibilité, etc.)"
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Ajouter le joueur
      </button>
    </form>
  );
}
