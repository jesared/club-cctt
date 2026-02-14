"use client";

import { FormEvent, useMemo, useState } from "react";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

type RegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  points: string;
  gender: "M" | "F" | "";
  club: string;
  tables: string[];
  website: string;
};

type TableOption = {
  value: string;
  label: string;
  minPoints: number | null;
  maxPoints: number | null;
  womenOnly?: boolean;
};

const TABLE_OPTIONS: TableOption[] = [
  { value: "C", label: "C (800 à 1399 pts) - 10:30", minPoints: 800, maxPoints: 1399 },
  { value: "A", label: "A (500 à 799 pts) - 11:30", minPoints: 500, maxPoints: 799 },
  { value: "D", label: "D (1100 à 1699 pts) - 12:30", minPoints: 1100, maxPoints: 1699 },
  { value: "B", label: "B (500 à 1099 pts) - 13:30", minPoints: 500, maxPoints: 1099 },
  { value: "F", label: "F (500 à 1199 pts) - 08:30", minPoints: 500, maxPoints: 1199 },
  { value: "H", label: "H (1200 à 1799 pts) - 09:30", minPoints: 1200, maxPoints: 1799 },
  { value: "E", label: "E (500 à 899 pts) - 11:00", minPoints: 500, maxPoints: 899 },
  { value: "G", label: "G (900 à 1499 pts) - 12:00", minPoints: 900, maxPoints: 1499 },
  { value: "I", label: "I (500 à N°400) - 13:15", minPoints: 500, maxPoints: null },
  { value: "J", label: "J (Dames TC) - 14:30", minPoints: null, maxPoints: null, womenOnly: true },
  { value: "L", label: "L (500 à 1299 pts) - 08:30", minPoints: 500, maxPoints: 1299 },
  { value: "N", label: "N (1300 à 2099 pts) - 09:30", minPoints: 1300, maxPoints: 2099 },
  { value: "K", label: "K (500 à 999 pts) - 11:00", minPoints: 500, maxPoints: 999 },
  { value: "M", label: "M (1000 à 1599 pts) - 12:00", minPoints: 1000, maxPoints: 1599 },
  { value: "P", label: "P (Toutes catégories) - 13:15", minPoints: null, maxPoints: null },
] as const;

const initialData: RegistrationPayload = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenseNumber: "",
  points: "",
  gender: "",
  club: "",
  tables: [],
  website: "",
};

function isEligible(points: number | null, gender: "M" | "F" | "", table: TableOption) {
  if (table.womenOnly && gender !== "F") {
    return false;
  }

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

export default function TournamentRegistrationForm() {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const parsedPoints = useMemo(() => {
    if (!formData.points.trim()) {
      return null;
    }

    const numericPoints = Number.parseInt(formData.points, 10);
    return Number.isNaN(numericPoints) ? null : numericPoints;
  }, [formData.points]);

  const ineligibleTableCodes = useMemo(
    () => TABLE_OPTIONS.filter((table) => !isEligible(parsedPoints, formData.gender, table)).map((table) => table.value),
    [formData.gender, parsedPoints],
  );

  const canSubmit = useMemo(() => formData.tables.length > 0, [formData.tables.length]);

  const toggleTable = (tableCode: string) => {
    setFormData((current) => {
      const table = TABLE_OPTIONS.find((option) => option.value === tableCode);
      if (!table || !isEligible(parsedPoints, current.gender, table)) {
        return current;
      }

      const exists = current.tables.includes(tableCode);
      return {
        ...current,
        tables: exists
          ? current.tables.filter((value) => value !== tableCode)
          : [...current.tables, tableCode],
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setFeedback({
        type: "error",
        message: "Merci de sélectionner au moins un tableau.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/tournoi/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Une erreur est survenue.");
      }

      setFeedback({
        type: "success",
        message:
          payload.message ??
          "Votre demande d'inscription a bien été envoyée. Nous vous confirmerons par email.",
      });
      setFormData(initialData);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer votre inscription pour le moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoMessage = useMemo(() => {
    if (!formData.points.trim()) {
      return "Renseignez vos points pour filtrer automatiquement les tableaux disponibles.";
    }

    if (parsedPoints === null || parsedPoints < 0) {
      return "Points invalides : veuillez saisir un nombre positif.";
    }

    if (ineligibleTableCodes.length === 0) {
      return "Tous les tableaux sont disponibles avec ces informations.";
    }

    return `Tableaux indisponibles : ${ineligibleTableCodes.join(", ")}.`;
  }, [formData.points, ineligibleTableCodes, parsedPoints]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={formData.lastName}
            onChange={(event) =>
              setFormData((current) => ({ ...current, lastName: event.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="DUPONT"
          />
        </div>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={formData.firstName}
            onChange={(event) =>
              setFormData((current) => ({ ...current, firstName: event.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Jean"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email de contact
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={150}
            value={formData.email}
            onChange={(event) =>
              setFormData((current) => ({ ...current, email: event.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="joueur@email.fr"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            minLength={10}
            maxLength={20}
            value={formData.phone}
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-12">
        <div className="sm:col-span-3">
          <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
            N° licence FFTT
          </label>
          <input
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            required
            minLength={6}
            maxLength={20}
            value={formData.licenseNumber}
            onChange={(event) =>
              setFormData((current) => ({ ...current, licenseNumber: event.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="1234567"
          />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="points" className="block text-sm font-medium mb-1">
            Points
          </label>
          <input
            id="points"
            name="points"
            type="number"
            min={0}
            required
            value={formData.points}
            onChange={(event) =>
              setFormData((current) => {
                const nextValue = event.target.value;
                const nextPoints = Number.parseInt(nextValue, 10);

                if (!nextValue.trim() || Number.isNaN(nextPoints)) {
                  return { ...current, points: nextValue };
                }

                return {
                  ...current,
                  points: nextValue,
                  tables: current.tables.filter((tableCode) => {
                    const table = TABLE_OPTIONS.find((option) => option.value === tableCode);
                    return table ? isEligible(nextPoints, current.gender, table) : false;
                  }),
                };
              })
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="1248"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="gender" className="block text-sm font-medium mb-1">
            Genre
          </label>
          <select
            id="gender"
            name="gender"
            required
            value={formData.gender}
            onChange={(event) =>
              setFormData((current) => {
                const nextGender = event.target.value as "M" | "F" | "";
                return {
                  ...current,
                  gender: nextGender,
                  tables: current.tables.filter((tableCode) => {
                    const table = TABLE_OPTIONS.find((option) => option.value === tableCode);
                    return table ? isEligible(parsedPoints, nextGender, table) : false;
                  }),
                };
              })
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option className="bg-card text-foreground" value="">Sélectionner</option>
            <option className="bg-card text-foreground" value="M">M</option>
            <option className="bg-card text-foreground" value="F">F</option>
          </select>
        </div>
        <div className="sm:col-span-4">
          <label htmlFor="club" className="block text-sm font-medium mb-1">
            Club
          </label>
          <input
            id="club"
            name="club"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={formData.club}
            onChange={(event) =>
              setFormData((current) => ({ ...current, club: event.target.value }))
            }
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Nom du club"
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tableaux souhaités</legend>
        <p className="text-sm text-gray-600">Vous pouvez sélectionner plusieurs tableaux.</p>
        <p className="rounded-md border border-border bg-accent/25 px-3 py-2 text-xs text-foreground/80">{infoMessage}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TABLE_OPTIONS.map((table) => (
            <label
              key={table.value}
              className={`flex items-start gap-2 rounded-md border px-3 py-2 ${
                isEligible(parsedPoints, formData.gender, table)
                  ? "border-border"
                  : "cursor-not-allowed border-border bg-muted/50 text-muted-foreground"
              }`}
            >
              <input
                type="checkbox"
                checked={formData.tables.includes(table.value)}
                disabled={!isEligible(parsedPoints, formData.gender, table)}
                onChange={() => toggleTable(table.value)}
                className="mt-1"
              />
              <span className="text-sm text-foreground">{table.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) =>
            setFormData((current) => ({ ...current, website: event.target.value }))
          }
        />
      </div>

      {feedback ? (
        <p
          className={`text-sm ${feedback.type === "success" ? "text-green-600" : "text-red-500"}`}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="inline-flex rounded-md bg-primary px-6 py-3 text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Envoi en cours..." : "Valider mon inscription"}
      </button>
    </form>
  );
}
