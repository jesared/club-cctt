"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { trackKpiEvent } from "@/lib/kpi";

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
  waitlistTables: string[];
  website: string;
};

type RegistrationField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "licenseNumber"
  | "points"
  | "gender"
  | "club"
  | "tables";

type FieldErrors = Partial<Record<RegistrationField, string>>;
type FieldTouched = Partial<Record<RegistrationField, boolean>>;

type TableOption = {
  value: string;
  label: string;
  dateLabel: string;
  dateKey: string;
  minPoints: number | null;
  maxPoints: number | null;
  gender: "MIXED" | "M" | "F";
  onlinePriceLabel: string;
  onsitePriceLabel: string;
  isFull: boolean;
  remainingSpots: number | null;
};

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
  waitlistTables: [],
  website: "",
};

const profileFields = [
  "lastName",
  "firstName",
  "email",
  "phone",
  "licenseNumber",
  "points",
  "gender",
  "club",
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEligible(
  points: number | null,
  gender: "M" | "F" | "",
  table: TableOption,
) {
  if (table.gender === "F" && gender !== "F") {
    return false;
  }

  if (table.gender === "M" && gender !== "M") {
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

function validateField(
  field: Exclude<RegistrationField, "tables">,
  value: string,
) {
  const trimmedValue = value.trim();

  switch (field) {
    case "lastName":
      if (!trimmedValue) {
        return "Indiquez le nom du joueur.";
      }
      if (trimmedValue.length < 2) {
        return "Le nom doit contenir au moins 2 caracteres.";
      }
      return undefined;
    case "firstName":
      if (!trimmedValue) {
        return "Indiquez le prenom du joueur.";
      }
      if (trimmedValue.length < 2) {
        return "Le prenom doit contenir au moins 2 caracteres.";
      }
      return undefined;
    case "email":
      if (!trimmedValue) {
        return "Indiquez une adresse e-mail de contact.";
      }
      if (!emailPattern.test(trimmedValue)) {
        return "Saisissez une adresse e-mail valide.";
      }
      return undefined;
    case "phone": {
      const digitsOnly = value.replace(/\D/g, "");
      if (!digitsOnly) {
        return "Indiquez un numero de telephone.";
      }
      if (digitsOnly.length < 10) {
        return "Le numero de telephone doit contenir au moins 10 chiffres.";
      }
      return undefined;
    }
    case "licenseNumber":
      if (!trimmedValue) {
        return "Indiquez le numero de licence FFTT.";
      }
      if (trimmedValue.length < 6) {
        return "Le numero de licence doit contenir au moins 6 caracteres.";
      }
      return undefined;
    case "points": {
      if (!trimmedValue) {
        return "Indiquez le nombre de points du joueur.";
      }
      const numericPoints = Number.parseInt(trimmedValue, 10);
      if (Number.isNaN(numericPoints) || numericPoints < 0) {
        return "Saisissez un nombre de points valide.";
      }
      return undefined;
    }
    case "gender":
      if (!trimmedValue) {
        return "Selectionnez le genre du joueur.";
      }
      return undefined;
    case "club":
      if (!trimmedValue) {
        return "Indiquez le nom du club.";
      }
      if (trimmedValue.length < 2) {
        return "Le nom du club doit contenir au moins 2 caracteres.";
      }
      return undefined;
    default:
      return undefined;
  }
}

type TournamentRegistrationFormProps = {
  tableOptions: TableOption[];
};

export default function TournamentRegistrationForm({
  tableOptions,
}: TournamentRegistrationFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<FieldTouched>({});

  const trackStartIfNeeded = () => {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    trackKpiEvent({
      eventType: "START",
      page: "tournoi-inscription",
      label: "form-start",
    });
  };

  const parsedPoints = useMemo(() => {
    if (!formData.points.trim()) {
      return null;
    }

    const numericPoints = Number.parseInt(formData.points, 10);
    return Number.isNaN(numericPoints) ? null : numericPoints;
  }, [formData.points]);

  const canChooseTables = parsedPoints !== null && parsedPoints >= 0;

  const groupedTableOptions = useMemo(() => {
    const grouped = new Map<
      string,
      { dateLabel: string; tables: TableOption[] }
    >();

    for (const table of tableOptions) {
      const existing = grouped.get(table.dateKey);
      if (existing) {
        existing.tables.push(table);
      } else {
        grouped.set(table.dateKey, {
          dateLabel: table.dateLabel,
          tables: [table],
        });
      }
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, group]) => ({
        dateKey,
        dateLabel: group.dateLabel,
        tables: group.tables,
      }));
  }, [tableOptions]);

  const selectedTables = useMemo(
    () =>
      tableOptions.filter((table) => formData.tables.includes(table.value)),
    [formData.tables, tableOptions],
  );

  const eligibleTableCount = useMemo(
    () =>
      tableOptions.filter((table) =>
        isEligible(parsedPoints, formData.gender, table),
      ).length,
    [formData.gender, parsedPoints, tableOptions],
  );

  const ineligibleTableCodes = useMemo(
    () =>
      tableOptions
        .filter((table) => !isEligible(parsedPoints, formData.gender, table))
        .map((table) => table.value),
    [formData.gender, parsedPoints, tableOptions],
  );

  const errorCount = useMemo(
    () => Object.values(fieldErrors).filter(Boolean).length,
    [fieldErrors],
  );

  const profileReady = useMemo(
    () =>
      profileFields.every(
        (field) => !validateField(field, String(formData[field])),
      ),
    [formData],
  );

  const readyToSubmit = profileReady && formData.tables.length > 0;
  const selectedWaitlistCount = formData.waitlistTables.length;
  const selectedDirectCount = selectedTables.length - selectedWaitlistCount;

  const validateTableSelection = (tables: string[]) => {
    if (!tables.length) {
      return "Selectionnez au moins un tableau pour continuer.";
    }
    return undefined;
  };

  const validateCurrentForm = (data: RegistrationPayload) => {
    const errors: FieldErrors = {};

    for (const field of profileFields) {
      const error = validateField(field, String(data[field]));
      if (error) {
        errors[field] = error;
      }
    }

    const tablesError = validateTableSelection(data.tables);
    if (tablesError) {
      errors.tables = tablesError;
    }

    return errors;
  };

  const updateFieldError = (
    field: Exclude<RegistrationField, "tables">,
    value: string,
  ) => {
    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, value),
    }));
  };

  const setTextFieldValue = <
    T extends Exclude<RegistrationField, "tables" | "gender">
  >(
    field: T,
    value: RegistrationPayload[T],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (touchedFields[field] || hasSubmitted) {
      updateFieldError(field, String(value));
    }
  };

  const markFieldAsTouched = (field: Exclude<RegistrationField, "tables">) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    updateFieldError(field, String(formData[field]));
  };

  const syncTablesError = (nextTables: string[]) => {
    if (touchedFields.tables || hasSubmitted) {
      setFieldErrors((current) => ({
        ...current,
        tables: validateTableSelection(nextTables),
      }));
    }
  };

  const handlePointsChange = (nextValue: string) => {
    setFormData((current) => {
      const nextPoints = Number.parseInt(nextValue, 10);

      if (!nextValue.trim() || Number.isNaN(nextPoints)) {
        const nextState = {
          ...current,
          points: nextValue,
          tables: [],
          waitlistTables: [],
        };
        syncTablesError(nextState.tables);
        return nextState;
      }

      const filteredTables = current.tables.filter((tableCode) => {
        const table = tableOptions.find((option) => option.value === tableCode);
        return table ? isEligible(nextPoints, current.gender, table) : false;
      });

      const filteredWaitlistTables = current.waitlistTables.filter(
        (tableCode) => {
          const table = tableOptions.find(
            (option) => option.value === tableCode,
          );
          return table
            ? isEligible(nextPoints, current.gender, table) &&
                filteredTables.includes(tableCode)
            : false;
        },
      );

      const nextState = {
        ...current,
        points: nextValue,
        tables: filteredTables,
        waitlistTables: filteredWaitlistTables,
      };
      syncTablesError(nextState.tables);
      return nextState;
    });

    if (touchedFields.points || hasSubmitted) {
      updateFieldError("points", nextValue);
    }
  };

  const handleGenderChange = (nextGender: "M" | "F" | "") => {
    setFormData((current) => {
      const filteredTables = current.tables.filter((tableCode) => {
        const table = tableOptions.find((option) => option.value === tableCode);
        return table ? isEligible(parsedPoints, nextGender, table) : false;
      });

      const filteredWaitlistTables = current.waitlistTables.filter(
        (tableCode) => {
          const table = tableOptions.find(
            (option) => option.value === tableCode,
          );
          return table
            ? isEligible(parsedPoints, nextGender, table) &&
                filteredTables.includes(tableCode)
            : false;
        },
      );

      const nextState = {
        ...current,
        gender: nextGender,
        tables: filteredTables,
        waitlistTables: filteredWaitlistTables,
      };
      syncTablesError(nextState.tables);
      return nextState;
    });

    if (touchedFields.gender || hasSubmitted) {
      updateFieldError("gender", nextGender);
    }
  };

  const toggleTable = (tableCode: string) => {
    setFormData((current) => {
      const table = tableOptions.find((option) => option.value === tableCode);
      if (!table || !isEligible(parsedPoints, current.gender, table)) {
        return current;
      }

      if (table.isFull) {
        return current;
      }

      const exists = current.tables.includes(tableCode);
      const nextTables = exists
        ? current.tables.filter((value) => value !== tableCode)
        : [...current.tables, tableCode];
      const nextWaitlistTables = exists
        ? current.waitlistTables.filter((value) => value !== tableCode)
        : current.waitlistTables;

      syncTablesError(nextTables);

      return {
        ...current,
        tables: nextTables,
        waitlistTables: nextWaitlistTables,
      };
    });
  };

  const handleWaitlistChange = (tableCode: string, wantsWaitlist: boolean) => {
    setFormData((current) => {
      const nextWaitlistTables = wantsWaitlist
        ? [...new Set([...current.waitlistTables, tableCode])]
        : current.waitlistTables.filter((value) => value !== tableCode);
      const nextTables = wantsWaitlist
        ? current.tables.includes(tableCode)
          ? current.tables
          : [...current.tables, tableCode]
        : current.tables.filter((value) => value !== tableCode);

      syncTablesError(nextTables);

      return {
        ...current,
        waitlistTables: nextWaitlistTables,
        tables: nextTables,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setFeedback(null);

    const nextErrors = validateCurrentForm(formData);
    setFieldErrors(nextErrors);
    setTouchedFields({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      licenseNumber: true,
      points: true,
      gender: true,
      club: true,
      tables: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        type: "error",
        message:
          "Verifiez les informations signalees avant d'envoyer votre demande.",
      });
      return;
    }

    setIsSubmitting(true);

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
          "Demande envoyee. Vous recevrez un e-mail de confirmation sous 48 h maximum apres verification des places.",
      });
      trackKpiEvent({
        eventType: "SUBMIT",
        page: "tournoi-inscription",
        label: "registration-submitted",
      });
      setFormData(initialData);
      setFieldErrors({});
      setTouchedFields({});
      setHasSubmitted(false);
      setHasStarted(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Envoi impossible pour le moment. Verifiez vos informations, puis reessayez dans quelques minutes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoMessage = useMemo(() => {
    if (!formData.points.trim()) {
      return "Indiquez vos points pour ouvrir l'etape de choix des tableaux.";
    }

    if (parsedPoints === null || parsedPoints < 0) {
      return "Points invalides : saisissez un nombre positif.";
    }

    if (!formData.gender) {
      return "Selectionnez aussi le genre du joueur pour filtrer precisement les tableaux.";
    }

    if (eligibleTableCount === 0) {
      return "Aucun tableau ne correspond actuellement a ces informations.";
    }

    if (ineligibleTableCodes.length === 0) {
      return "Tous les tableaux affiches sont compatibles avec ce profil.";
    }

    return `Certains tableaux restent visibles pour reperage mais ne sont pas accessibles : ${ineligibleTableCodes.join(", ")}.`;
  }, [
    eligibleTableCount,
    formData.gender,
    formData.points,
    ineligibleTableCodes,
    parsedPoints,
  ]);

  return (
    <form
      className={`space-y-6 ${hasSubmitted ? "form-submitted" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {[
          {
            label: "Etape 1",
            title: "Profil joueur",
            detail: profileReady
              ? "Informations completes."
              : "Nom, licence, points, contact.",
            done: profileReady,
            active: !profileReady,
          },
          {
            label: "Etape 2",
            title: "Choix des tableaux",
            detail:
              formData.tables.length > 0
                ? `${formData.tables.length} tableau${formData.tables.length > 1 ? "x" : ""} selectionne${formData.tables.length > 1 ? "s" : ""}.`
                : "Selectionnez vos tableaux compatibles.",
            done: formData.tables.length > 0,
            active: profileReady && formData.tables.length === 0,
          },
          {
            label: "Etape 3",
            title: "Validation",
            detail: readyToSubmit
              ? "Le dossier peut etre envoye."
              : "Verifiez le recapitulatif avant envoi.",
            done: readyToSubmit,
            active: profileReady && formData.tables.length > 0,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 ${
              item.done
                ? "border-primary/40 bg-primary/10"
                : item.active
                  ? "border-secondary/40 bg-secondary/20"
                  : "border-border bg-muted/30"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {item.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[1.5rem] border border-border/70 bg-background p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Etape 1
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              Completer le profil du joueur
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Ces informations nous permettent de filtrer les tableaux autorises
              et de vous recontacter rapidement en cas de besoin.
            </p>
          </div>
          <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            8 informations a verifier
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
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
              onChange={(event) => setTextFieldValue("lastName", event.target.value)}
              onBlur={() => markFieldAsTouched("lastName")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.lastName ? "true" : "false"}
              aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
              className="form-field"
              placeholder="DUPONT"
            />
            {fieldErrors.lastName ? (
              <p id="lastName-error" className="form-error" role="alert">
                {fieldErrors.lastName}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
              Prenom
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
                setTextFieldValue("firstName", event.target.value)
              }
              onBlur={() => markFieldAsTouched("firstName")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.firstName ? "true" : "false"}
              aria-describedby={
                fieldErrors.firstName ? "firstName-error" : undefined
              }
              className="form-field"
              placeholder="Jean"
            />
            {fieldErrors.firstName ? (
              <p id="firstName-error" className="form-error" role="alert">
                {fieldErrors.firstName}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail de contact
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={150}
              value={formData.email}
              onChange={(event) => setTextFieldValue("email", event.target.value)}
              onBlur={() => markFieldAsTouched("email")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.email ? "true" : "false"}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className="form-field"
              placeholder="joueur@email.fr"
            />
            {fieldErrors.email ? (
              <p id="email-error" className="form-error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Telephone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              minLength={10}
              maxLength={20}
              value={formData.phone}
              onChange={(event) => setTextFieldValue("phone", event.target.value)}
              onBlur={() => markFieldAsTouched("phone")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.phone ? "true" : "false"}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              className="form-field"
              placeholder="06 12 34 56 78"
            />
            {fieldErrors.phone ? (
              <p id="phone-error" className="form-error" role="alert">
                {fieldErrors.phone}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <label
              htmlFor="licenseNumber"
              className="mb-1 block text-sm font-medium"
            >
              Numero licence FFTT
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
                setTextFieldValue("licenseNumber", event.target.value)
              }
              onBlur={() => markFieldAsTouched("licenseNumber")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.licenseNumber ? "true" : "false"}
              aria-describedby={
                fieldErrors.licenseNumber ? "licenseNumber-error" : undefined
              }
              className="form-field"
              placeholder="1234567"
            />
            {fieldErrors.licenseNumber ? (
              <p id="licenseNumber-error" className="form-error" role="alert">
                {fieldErrors.licenseNumber}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="points" className="mb-1 block text-sm font-medium">
              Points
            </label>
            <input
              id="points"
              name="points"
              type="number"
              min={0}
              required
              value={formData.points}
              onChange={(event) => handlePointsChange(event.target.value)}
              onBlur={() => markFieldAsTouched("points")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.points ? "true" : "false"}
              aria-describedby={fieldErrors.points ? "points-error" : undefined}
              className="form-field"
              placeholder="1248"
            />
            {fieldErrors.points ? (
              <p id="points-error" className="form-error" role="alert">
                {fieldErrors.points}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="gender" className="mb-1 block text-sm font-medium">
              Genre
            </label>
            <select
              id="gender"
              name="gender"
              required
              value={formData.gender}
              onChange={(event) =>
                handleGenderChange(event.target.value as "M" | "F" | "")
              }
              onBlur={() => markFieldAsTouched("gender")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.gender ? "true" : "false"}
              aria-describedby={fieldErrors.gender ? "gender-error" : undefined}
              className="form-field"
            >
              <option className="bg-card text-foreground" value="">
                Selectionner
              </option>
              <option className="bg-card text-foreground" value="M">
                M
              </option>
              <option className="bg-card text-foreground" value="F">
                F
              </option>
            </select>
            {fieldErrors.gender ? (
              <p id="gender-error" className="form-error" role="alert">
                {fieldErrors.gender}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-4">
            <label htmlFor="club" className="mb-1 block text-sm font-medium">
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
              onChange={(event) => setTextFieldValue("club", event.target.value)}
              onBlur={() => markFieldAsTouched("club")}
              onFocus={trackStartIfNeeded}
              aria-invalid={fieldErrors.club ? "true" : "false"}
              aria-describedby={fieldErrors.club ? "club-error" : undefined}
              className="form-field"
              placeholder="Nom du club"
            />
            {fieldErrors.club ? (
              <p id="club-error" className="form-error" role="alert">
                {fieldErrors.club}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-background p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Etape 2
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                Choisir les tableaux
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Le filtrage se met a jour a partir des points et du genre saisis.
                Les tableaux complets restent visibles pour une eventuelle liste
                d&apos;attente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/40 px-3 py-1">
                {eligibleTableCount} compatible
                {eligibleTableCount > 1 ? "s" : ""}
              </span>
              <span className="rounded-full border border-border bg-muted/40 px-3 py-1">
                {formData.tables.length} selection
                {formData.tables.length > 1 ? "s" : ""}
              </span>
              {selectedWaitlistCount > 0 ? (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-800">
                  {selectedWaitlistCount} en attente
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">{infoMessage}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Astuce : si un tableau ne s&apos;active pas, verifiez d&apos;abord
              les points ou le genre du joueur.
            </p>
          </div>

          {canChooseTables ? (
            <fieldset
              className="space-y-5"
              aria-describedby={fieldErrors.tables ? "tables-error" : undefined}
            >
              <legend className="sr-only">Choix des tableaux</legend>

              {groupedTableOptions.map((group) => (
                <div key={group.dateKey} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold capitalize text-foreground">
                      {group.dateLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.tables.length} tableau
                      {group.tables.length > 1 ? "x" : ""} proposes
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.tables.map((table) => {
                      const isSelectable = isEligible(
                        parsedPoints,
                        formData.gender,
                        table,
                      );
                      const isSelected = formData.tables.includes(table.value);
                      const isWaitlist = formData.waitlistTables.includes(
                        table.value,
                      );

                      return (
                        <div
                          key={table.value}
                          className={`rounded-2xl border p-4 ${
                            isSelected
                              ? "border-primary/40 bg-primary/10 shadow-sm"
                              : "border-border bg-background"
                          } ${!isSelectable ? "bg-muted/60 text-muted-foreground" : ""}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">
                                {table.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                En ligne : {table.onlinePriceLabel} | Sur place :{" "}
                                {table.onsitePriceLabel}
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                table.isFull
                                  ? "bg-amber-100 text-amber-800"
                                  : isSelectable
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {table.isFull
                                ? "Complet"
                                : isSelectable
                                  ? "Disponible"
                                  : "Non accessible"}
                            </span>
                          </div>

                          {table.remainingSpots !== null && !table.isFull ? (
                            <p className="mt-3 text-xs text-muted-foreground">
                              {table.remainingSpots} place
                              {table.remainingSpots > 1 ? "s" : ""} restante
                              {table.remainingSpots > 1 ? "s" : ""}
                            </p>
                          ) : null}

                          {!isSelectable ? (
                            <p className="mt-3 rounded-xl border border-border/80 bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
                              Ce tableau ne correspond pas aux informations
                              actuellement saisies.
                            </p>
                          ) : null}

                          {isSelectable && !table.isFull ? (
                            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-muted/20 px-3 py-3 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleTable(table.value)}
                                className="mt-1 accent-primary"
                              />
                              <span>
                                {isSelected
                                  ? "Retirer ce tableau de ma selection"
                                  : "Ajouter ce tableau a ma selection"}
                              </span>
                            </label>
                          ) : null}

                          {isSelectable && table.isFull ? (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm text-amber-900">
                              <p className="font-medium">
                                Ce tableau est complet.
                              </p>
                              <label className="mt-2 flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isWaitlist}
                                  onChange={(event) =>
                                    handleWaitlistChange(
                                      table.value,
                                      event.target.checked,
                                    )
                                  }
                                  className="mt-1 accent-primary"
                                />
                                <span>
                                  Me placer sur la liste d&apos;attente pour ce
                                  tableau
                                </span>
                              </label>
                            </div>
                          ) : null}

                          {isSelected ? (
                            <p className="mt-3 text-xs font-medium text-foreground">
                              {isWaitlist
                                ? "Selection en liste d'attente."
                                : "Tableau ajoute au recapitulatif."}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {fieldErrors.tables ? (
                <p id="tables-error" className="form-error" role="alert">
                  {fieldErrors.tables}
                </p>
              ) : null}
            </fieldset>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
              L&apos;etape de selection s&apos;active des que le nombre de points
              du joueur est renseigne.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-background p-5 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Etape 3
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                Verifier puis envoyer
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Avant l&apos;envoi, controlez les coordonnees de contact et la
                liste des tableaux souhaites. Les tableaux complets restent en
                attente de validation finale.
              </p>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-xs ${
                readyToSubmit
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {readyToSubmit ? "Pret a envoyer" : "Dossier incomplet"}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                Recapitulatif du joueur
              </p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  <span className="font-medium text-foreground">Joueur :</span>{" "}
                  {formData.firstName || "-"} {formData.lastName || ""}
                </p>
                <p>
                  <span className="font-medium text-foreground">Club :</span>{" "}
                  {formData.club || "-"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Licence :</span>{" "}
                  {formData.licenseNumber || "-"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Points :</span>{" "}
                  {formData.points || "-"}
                </p>
                <p>
                  <span className="font-medium text-foreground">E-mail :</span>{" "}
                  {formData.email || "-"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Telephone :</span>{" "}
                  {formData.phone || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                Recapitulatif des tableaux
              </p>
              {selectedTables.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {selectedTables.map((table) => {
                    const isWaitlist = formData.waitlistTables.includes(
                      table.value,
                    );

                    return (
                      <div
                        key={table.value}
                        className="rounded-xl border border-border/70 bg-background px-3 py-3"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {table.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isWaitlist
                            ? "Liste d'attente demandee"
                            : "Selection immediate"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucun tableau selectionne pour le moment.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Profil valide",
                value: profileReady,
              },
              {
                label: "Tableaux choisis",
                value: formData.tables.length > 0,
              },
              {
                label: "Envoi possible",
                value: readyToSubmit,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  item.value
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                <p className="font-medium">{item.label}</p>
                <p className="mt-1 text-xs">
                  {item.value ? "Oui" : "A completer"}
                </p>
              </div>
            ))}
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
                setFormData((current) => ({
                  ...current,
                  website: event.target.value,
                }))
              }
            />
          </div>

          {feedback ? (
            <p
              className={`flex items-center gap-2 text-sm ${
                feedback.type === "success" ? "text-primary" : "text-destructive"
              }`}
              role={feedback.type === "success" ? "status" : "alert"}
              aria-live={feedback.type === "success" ? "polite" : "assertive"}
            >
              {feedback.type === "success" ? (
                <Check className="h-4 w-4" />
              ) : null}
              {feedback.message}
              {feedback.type === "error" && errorCount > 0
                ? ` (${errorCount} point${errorCount > 1 ? "s" : ""} a corriger)`
                : null}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {selectedDirectCount > 0
                ? `${selectedDirectCount} tableau${selectedDirectCount > 1 ? "x" : ""} demande${selectedDirectCount > 1 ? "s" : ""} en inscription directe.`
                : "Aucun tableau en inscription directe pour le moment."}
              {selectedWaitlistCount > 0
                ? ` ${selectedWaitlistCount} tableau${selectedWaitlistCount > 1 ? "x" : ""} en liste d'attente.`
                : ""}
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer inline-flex rounded-md bg-primary px-6 py-3 text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-ring active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </span>
              ) : (
                "Envoyer ma demande"
              )}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
