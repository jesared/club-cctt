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
  ranking: string;
  club: string;
  tables: string[];
  notes: string;
  website: string;
};

const TABLE_OPTIONS = [
  { value: "A", label: "Tableau A (1700+ points)" },
  { value: "B", label: "Tableau B (1300 à 1699 points)" },
  { value: "C", label: "Tableau C (900 à 1299 points)" },
  { value: "D", label: "Tableau D (< 900 points)" },
  { value: "X", label: "Doubles / toutes catégories" },
] as const;

const initialData: RegistrationPayload = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenseNumber: "",
  ranking: "",
  club: "",
  tables: [],
  notes: "",
  website: "",
};

export default function TournamentRegistrationForm() {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const canSubmit = useMemo(() => formData.tables.length > 0, [formData.tables.length]);

  const toggleTable = (tableCode: string) => {
    setFormData((current) => {
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="1234567"
          />
        </div>
        <div>
          <label htmlFor="ranking" className="block text-sm font-medium mb-1">
            Classement / points
          </label>
          <input
            id="ranking"
            name="ranking"
            type="text"
            maxLength={20}
            value={formData.ranking}
            onChange={(event) =>
              setFormData((current) => ({ ...current, ranking: event.target.value }))
            }
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="12 / 1248"
          />
        </div>
        <div>
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
            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nom du club"
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Tableaux souhaités</legend>
        <p className="text-sm text-gray-600">Vous pouvez sélectionner plusieurs tableaux.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TABLE_OPTIONS.map((table) => (
            <label
              key={table.value}
              className="flex items-start gap-2 rounded-md border border-gray-200 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={formData.tables.includes(table.value)}
                onChange={() => toggleTable(table.value)}
                className="mt-1"
              />
              <span className="text-sm text-gray-800">{table.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Remarques (optionnel)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={1000}
          value={formData.notes}
          onChange={(event) =>
            setFormData((current) => ({ ...current, notes: event.target.value }))
          }
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Disponibilités, accompagnant, informations utiles..."
        />
      </div>

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
          className={`text-sm ${feedback.type === "success" ? "text-green-700" : "text-red-700"}`}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="inline-flex bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Envoi en cours..." : "Valider mon inscription"}
      </button>
    </form>
  );
}
