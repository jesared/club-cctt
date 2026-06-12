"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Loader2,
  Search,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";

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

type PlayerGender = "M" | "F" | "";

type FfttLookupState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

type FfttLookupResponse = {
  player?: {
    licence: string;
    nom: string;
    prenom: string;
    points: number | null;
    club: string;
    gender: PlayerGender;
  };
  error?: string;
};

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

type StepId = "profile" | "tables" | "review";

type StepDefinition = {
  id: StepId;
  title: string;
  shortTitle: string;
  description: string;
  icon: typeof UserRound;
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

const steps: StepDefinition[] = [
  {
    id: "profile",
    title: "Profil du joueur",
    shortTitle: "Profil",
    description: "Licence FFTT, données joueur et contact.",
    icon: UserRound,
  },
  {
    id: "tables",
    title: "Choix des tableaux",
    shortTitle: "Tableaux",
    description: "Filtrage par points, genre et places.",
    icon: Trophy,
  },
  {
    id: "review",
    title: "Validation finale",
    shortTitle: "Validation",
    description: "Contrôle du dossier avant envoi.",
    icon: ClipboardCheck,
  },
];

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
        return "Indiquez le prénom du joueur.";
      }
      if (trimmedValue.length < 2) {
        return "Le prénom doit contenir au moins 2 caractères.";
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
      if (trimmedValue.length < 3) {
        return "Le numero de licence doit contenir au moins 3 caracteres.";
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
        return "Sélectionnez le genre du joueur.";
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

function validateTableSelection(tables: string[]) {
  if (!tables.length) {
    return "Sélectionnez au moins un tableau pour continuer.";
  }
  return undefined;
}

function formatPlayerName(formData: RegistrationPayload) {
  const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
  return name || "Joueur non renseigné";
}

function formatGender(gender: PlayerGender) {
  if (gender === "F") {
    return "Feminin";
  }

  if (gender === "M") {
    return "Masculin";
  }

  return "";
}

type TournamentRegistrationFormProps = {
  tableOptions: TableOption[];
};

export default function TournamentRegistrationForm({
  tableOptions,
}: TournamentRegistrationFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<FieldTouched>({});
  const [ffttLookup, setFfttLookup] = useState<FfttLookupState>({
    status: "idle",
    message: "",
  });

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

  const selectedTotalCents = useMemo(
    () =>
      selectedTables.reduce((total, table) => {
        const numericPrice = Number.parseInt(table.onlinePriceLabel, 10);
        return Number.isNaN(numericPrice) ? total : total + numericPrice * 100;
      }, 0),
    [selectedTables],
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
  const currentStepDefinition = steps[currentStep];
  const hasFfttPlayer = ffttLookup.status === "success";

  const validateProfile = (data: RegistrationPayload) => {
    const errors: FieldErrors = {};

    for (const field of profileFields) {
      const error = validateField(field, String(data[field]));
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  };

  const validateCurrentForm = (data: RegistrationPayload) => {
    const errors = validateProfile(data);
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

  const handleLicenseChange = (value: string) => {
    setFormData((current) => ({
      ...current,
      licenseNumber: value,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      points: "",
      gender: "",
      club: "",
      tables: [],
      waitlistTables: [],
    }));
    setFfttLookup({ status: "idle", message: "" });

    if (touchedFields.licenseNumber || hasSubmitted) {
      updateFieldError("licenseNumber", value);
    }
    syncTablesError([]);
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

  const keepEligibleSelections = (
    tables: string[],
    waitlistTables: string[],
    pointsValue: string,
    gender: PlayerGender,
  ) => {
    const nextPoints = pointsValue.trim()
      ? Number.parseInt(pointsValue, 10)
      : null;
    const normalizedPoints =
      nextPoints !== null && !Number.isNaN(nextPoints) ? nextPoints : null;

    const filteredTables = tables.filter((tableCode) => {
      const table = tableOptions.find((option) => option.value === tableCode);
      return table ? isEligible(normalizedPoints, gender, table) : false;
    });

    return {
      tables: filteredTables,
      waitlistTables: waitlistTables.filter((tableCode) =>
        filteredTables.includes(tableCode),
      ),
    };
  };

  const lookupFfttLicense = async () => {
    const licenseNumber = formData.licenseNumber.trim();

    if (!licenseNumber) {
      setFfttLookup({
        status: "error",
        message: "Renseignez d'abord le numero de licence.",
      });
      setFieldErrors((current) => ({
        ...current,
        licenseNumber: "Indiquez le numero de licence FFTT.",
      }));
      return;
    }

    setFfttLookup({
      status: "loading",
      message: "Recherche FFTT en cours...",
    });

    try {
      const response = await fetch(
        `/api/tournoi/fftt/license?licence=${encodeURIComponent(licenseNumber)}`,
      );
      const data = (await response.json().catch(() => ({}))) as FfttLookupResponse;

      if (!response.ok || !data.player) {
        throw new Error(data.error || "Joueur FFTT introuvable.");
      }

      setFormData((current) => {
        const nextPoints =
          data.player?.points !== null && data.player?.points !== undefined
            ? data.player.points.toString()
            : current.points;
        const nextGender = data.player?.gender ?? current.gender;
        const nextSelections = keepEligibleSelections(
          current.tables,
          current.waitlistTables,
          nextPoints,
          nextGender,
        );

        return {
          ...current,
          firstName: data.player?.prenom || current.firstName,
          lastName: data.player?.nom || current.lastName,
          licenseNumber: data.player?.licence || current.licenseNumber,
          points: nextPoints,
          gender: nextGender,
          club: data.player?.club || current.club,
          ...nextSelections,
        };
      });
      setFieldErrors((current) => ({
        ...current,
        firstName: undefined,
        lastName: undefined,
        licenseNumber: undefined,
        points: undefined,
        gender: undefined,
        club: undefined,
      }));
      setFfttLookup({
        status: "success",
        message: "Profil FFTT trouvé.",
      });
    } catch (error) {
      setFfttLookup({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les infos FFTT.",
      });
      setFormData((current) => ({
        ...current,
        firstName: "",
        lastName: "",
        points: "",
        gender: "",
        club: "",
        tables: [],
        waitlistTables: [],
      }));
    }
  };

  const focusWizardTop = () => {
    window.requestAnimationFrame(() => {
      document
        .getElementById("tournament-registration-wizard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setFeedback(null);
    focusWizardTop();
  };

  const completeProfileStep = () => {
    if (!hasFfttPlayer) {
      setTouchedFields((current) => ({
        ...current,
        licenseNumber: true,
      }));
      setFeedback({
        type: "error",
        message:
          "Lancez d'abord la recherche FFTT pour récupérer les données du joueur.",
      });
      return;
    }

    const errors = validateProfile(formData);
    setFieldErrors((current) => ({ ...current, ...errors }));
    setTouchedFields((current) => ({
      ...current,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      licenseNumber: true,
      points: true,
      gender: true,
      club: true,
    }));

    if (Object.keys(errors).length > 0) {
      setFeedback({
        type: "error",
        message: "Complétez les informations du joueur avant de continuer.",
      });
      return;
    }

    goToStep(1);
  };

  const completeTablesStep = () => {
    const tablesError = validateTableSelection(formData.tables);
    setTouchedFields((current) => ({ ...current, tables: true }));
    setFieldErrors((current) => ({
      ...current,
      tables: tablesError,
    }));

    if (tablesError) {
      setFeedback({
        type: "error",
        message: tablesError,
      });
      return;
    }

    goToStep(2);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      goToStep(stepIndex);
      return;
    }

    if (stepIndex === 1) {
      completeProfileStep();
      return;
    }

    if (stepIndex === 2) {
      if (!profileReady) {
        completeProfileStep();
        return;
      }
      completeTablesStep();
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

  const resetForm = () => {
    setFormData(initialData);
    setFieldErrors({});
    setTouchedFields({});
    setFeedback(null);
    setSuccessMessage("");
    setHasSubmitted(false);
    setHasStarted(false);
    setCurrentStep(0);
    setFfttLookup({ status: "idle", message: "" });
    focusWizardTop();
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
      setCurrentStep(nextErrors.tables && profileReady ? 1 : 0);
      setFeedback({
        type: "error",
        message:
          "Vérifiez les informations signalees avant d'envoyer votre demande.",
      });
      focusWizardTop();
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

      const message =
        payload.message ??
        "Demande envoyée. Vous recevrez un e-mail de confirmation sous 48 h maximum après vérification des places.";

      setSuccessMessage(message);
      setFeedback({
        type: "success",
        message,
      });
      trackKpiEvent({
        eventType: "SUBMIT",
        page: "tournoi-inscription",
        label: "registration-submitted",
      });
      setFieldErrors({});
      setTouchedFields({});
      setHasSubmitted(false);
      setHasStarted(false);
      focusWizardTop();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Envoi impossible pour le moment. Vérifiez vos informations, puis reessayez dans quelques minutes.",
      });
      focusWizardTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoMessage = useMemo(() => {
    if (!formData.points.trim()) {
      return "Indiquez vos points pour ouvrir le choix des tableaux.";
    }

    if (parsedPoints === null || parsedPoints < 0) {
      return "Points invalides : saisissez un nombre positif.";
    }

    if (!formData.gender) {
      return "Sélectionnez aussi le genre du joueur pour filtrer précisément les tableaux.";
    }

    if (eligibleTableCount === 0) {
    return "Aucun tableau ne correspond actuellement à ces informations.";
    }

    if (ineligibleTableCodes.length === 0) {
      return "Tous les tableaux affiches sont compatibles avec ce profil.";
    }

    return `Certains tableaux restent visibles pour repérage mais ne sont pas accessibles : ${ineligibleTableCodes.join(", ")}.`;
  }, [
    eligibleTableCount,
    formData.gender,
    formData.points,
    ineligibleTableCodes,
    parsedPoints,
  ]);

  if (successMessage) {
    return (
      <section
        id="tournament-registration-wizard"
        className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-secondary/15 shadow-sm"
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Check className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Demande d&apos;inscription envoyée
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {successMessage}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Joueur", value: formatPlayerName(formData) },
                {
                  label: "Tableaux",
                  value: `${selectedTables.length} sélection${selectedTables.length > 1 ? "s" : ""}`,
                },
                {
                  label: "Statut",
                  value:
                    selectedWaitlistCount > 0
                      ? "Avec attente"
                      : "À vérifier",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/user/inscriptions"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-ring"
              >
                Voir mes inscriptions
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted/40 focus-ring"
              >
                Inscrire un autre joueur
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
            <p className="text-sm font-semibold text-foreground">
              Prochaine étape
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Le club vérifie les places et les informations du joueur.</p>
              <p>
                Le suivi du dossier et du paiement se fait depuis votre espace
                utilisateur.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      id="tournament-registration-wizard"
    className={`space-y-3 ${hasSubmitted ? "form-submitted" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="rounded-xl border border-border/70 bg-background shadow-sm">
        <div className="rounded-t-xl border-b border-border/70 bg-gradient-to-br from-muted/30 via-background to-primary/5 p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                {currentStepDefinition.title}
              </h2>
              <p className="max-w-2xl text-sm leading-snug text-muted-foreground">
                {currentStepDefinition.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-background/80 px-3 py-1">
                {selectedTables.length} tableau
                {selectedTables.length > 1 ? "x" : ""}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isDone =
                (index === 0 && profileReady) ||
                (index === 1 && formData.tables.length > 0) ||
                (index === 2 && readyToSubmit);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  className={`group flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition focus-ring sm:flex-row sm:justify-start sm:gap-2 sm:text-left ${
                    isActive
                      ? "border-primary/50 bg-primary/10 text-foreground shadow-sm"
                      : isDone
                        ? "border-primary/25 bg-background/90 text-foreground hover:border-primary/40"
                        : "border-border bg-background/70 text-muted-foreground hover:bg-muted/35"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold sm:text-sm">
                      {step.shortTitle}
                    </span>
                    <span className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block">
                      {step.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 p-3 sm:p-4">
            {feedback ? (
              <div
                className={`mb-3 flex items-start gap-3 rounded-lg border p-3 text-sm ${
                  feedback.type === "success"
                    ? "border-primary/25 bg-primary/10 text-foreground"
                    : "border-destructive/30 bg-destructive/8 text-foreground"
                }`}
                role={feedback.type === "success" ? "status" : "alert"}
                aria-live={feedback.type === "success" ? "polite" : "assertive"}
              >
                {feedback.type === "success" ? (
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <p>
                  {feedback.message}
                  {feedback.type === "error" && errorCount > 0
                    ? ` (${errorCount} point${errorCount > 1 ? "s" : ""} à corriger)`
                    : null}
                </p>
              </div>
            ) : null}

            {currentStep === 0 ? (
              <ProfileStep
                formData={formData}
                fieldErrors={fieldErrors}
                ffttLookup={ffttLookup}
                hasFfttPlayer={hasFfttPlayer}
                handleLicenseChange={handleLicenseChange}
                setTextFieldValue={setTextFieldValue}
                handleGenderChange={handleGenderChange}
                lookupFfttLicense={lookupFfttLicense}
                markFieldAsTouched={markFieldAsTouched}
                trackStartIfNeeded={trackStartIfNeeded}
              />
            ) : null}

            {currentStep === 1 ? (
              <TablesStep
                canChooseTables={canChooseTables}
                eligibleTableCount={eligibleTableCount}
                fieldErrors={fieldErrors}
                formData={formData}
                groupedTableOptions={groupedTableOptions}
                handleWaitlistChange={handleWaitlistChange}
                infoMessage={infoMessage}
                parsedPoints={parsedPoints}
                selectedWaitlistCount={selectedWaitlistCount}
                toggleTable={toggleTable}
              />
            ) : null}

            {currentStep === 2 ? (
              <ReviewStep
                formData={formData}
                selectedTables={selectedTables}
                selectedWaitlistCount={selectedWaitlistCount}
              />
            ) : null}
          </div>

          <aside className="hidden border-l border-border/70 bg-muted/15 p-4 xl:block">
            <WizardSummary
              formData={formData}
              profileReady={profileReady}
              readyToSubmit={readyToSubmit}
              selectedTables={selectedTables}
              selectedTotalCents={selectedTotalCents}
            />
          </aside>
        </div>

        <div className="sticky bottom-0 z-20 rounded-b-xl border-t border-border/70 bg-background/95 p-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:flex sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => goToStep(Math.max(currentStep - 1, 0))}
            disabled={currentStep === 0 || isSubmitting}
            className={`h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-45 focus-ring ${
              currentStep === 0 ? "hidden sm:inline-flex" : "inline-flex"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Étape {currentStep + 1} sur {steps.length}
            </p>

            {currentStep === 0 ? (
              <button
                type="button"
                onClick={completeProfileStep}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-ring"
              >
                Continuer
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={completeTablesStep}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-ring"
              >
                Voir le récapitulatif
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}

            {currentStep === 2 ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer ma demande
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
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
    </form>
  );
}

function ProfileStep({
  fieldErrors,
  ffttLookup,
  formData,
  handleLicenseChange,
  hasFfttPlayer,
  handleGenderChange,
  lookupFfttLicense,
  markFieldAsTouched,
  setTextFieldValue,
  trackStartIfNeeded,
}: {
  fieldErrors: FieldErrors;
  ffttLookup: FfttLookupState;
  formData: RegistrationPayload;
  handleLicenseChange: (value: string) => void;
  hasFfttPlayer: boolean;
  handleGenderChange: (value: "M" | "F" | "") => void;
  lookupFfttLicense: () => Promise<void>;
  markFieldAsTouched: (field: Exclude<RegistrationField, "tables">) => void;
  setTextFieldValue: <
    T extends Exclude<RegistrationField, "tables" | "gender">
  >(
    field: T,
    value: RegistrationPayload[T],
  ) => void;
  trackStartIfNeeded: () => void;
}) {
  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <FieldShell
          error={fieldErrors.licenseNumber}
          id="licenseNumber"
          label="Numéro de licence FFTT"
        >
          <div className="flex min-h-11 items-stretch overflow-hidden rounded-xl border border-input bg-background shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20">
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={formData.licenseNumber}
              onChange={(event) => handleLicenseChange(event.target.value)}
              onBlur={() => markFieldAsTouched("licenseNumber")}
              onFocus={trackStartIfNeeded}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void lookupFfttLicense();
                }
              }}
              aria-invalid={fieldErrors.licenseNumber ? "true" : "false"}
              aria-describedby={
                fieldErrors.licenseNumber ? "licenseNumber-error" : undefined
              }
              className="min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 py-2 text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Ex : 1234567"
            />

            <button
              type="button"
              disabled={
                !formData.licenseNumber.trim() ||
                ffttLookup.status === "loading"
              }
              onClick={() => void lookupFfttLicense()}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border-l border-border bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none"
            >
              {ffttLookup.status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {ffttLookup.status === "loading" ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </FieldShell>

        {ffttLookup.status !== "idle" ? (
          <p
            className={`mt-3 text-sm ${
              ffttLookup.status === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
            role={ffttLookup.status === "error" ? "alert" : "status"}
          >
            {ffttLookup.message}
          </p>
        ) : null}
      </div>

      {hasFfttPlayer ? (
        <div className="grid gap-2 rounded-lg border border-border/70 bg-background p-2 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyField
            error={fieldErrors.lastName}
            id="lastName"
            label="Nom"
            name="lastName"
            value={formData.lastName}
          />
          <ReadOnlyField
            error={fieldErrors.firstName}
            id="firstName"
            label="Prénom"
            name="firstName"
            value={formData.firstName}
          />
          <ReadOnlyField
            error={fieldErrors.points}
            id="points"
            label="Points"
            name="points"
            value={formData.points}
          />
          {formData.gender ? (
            <>
              <input type="hidden" name="gender" value={formData.gender} />
              <ReadOnlyField
                error={fieldErrors.gender}
                id="genderDisplay"
                label="Genre"
                value={formatGender(formData.gender)}
              />
            </>
          ) : (
            <FieldShell error={fieldErrors.gender} id="gender" label="Genre">
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
                aria-describedby={
                  fieldErrors.gender ? "gender-error" : undefined
                }
                className="form-field"
              >
                <option className="bg-card text-foreground" value="">
                  Choisir
                </option>
                <option className="bg-card text-foreground" value="M">
                  Masculin
                </option>
                <option className="bg-card text-foreground" value="F">
                  Féminin
                </option>
              </select>
            </FieldShell>
          )}
          <div className="sm:col-span-2 lg:col-span-4">
            <ReadOnlyField
              error={fieldErrors.club}
              id="club"
              label="Club"
              name="club"
              value={formData.club}
            />
          </div>
        </div>
      ) : null}

      {hasFfttPlayer ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldShell error={fieldErrors.email} id="email" label="E-mail">
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
          </FieldShell>

          <FieldShell error={fieldErrors.phone} id="phone" label="Téléphone">
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
          </FieldShell>
        </div>
      ) : null}
    </section>
  );
}

function TablesStep({
  canChooseTables,
  eligibleTableCount,
  fieldErrors,
  formData,
  groupedTableOptions,
  handleWaitlistChange,
  infoMessage,
  parsedPoints,
  selectedWaitlistCount,
  toggleTable,
}: {
  canChooseTables: boolean;
  eligibleTableCount: number;
  fieldErrors: FieldErrors;
  formData: RegistrationPayload;
  groupedTableOptions: Array<{
    dateKey: string;
    dateLabel: string;
    tables: TableOption[];
  }>;
  handleWaitlistChange: (tableCode: string, wantsWaitlist: boolean) => void;
  infoMessage: string;
  parsedPoints: number | null;
  selectedWaitlistCount: number;
  toggleTable: (tableCode: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <MetricPill label="Compatibles" value={String(eligibleTableCount)} />
        <MetricPill label="Sélectionnés" value={String(formData.tables.length)} />
        <MetricPill label="En attente" value={String(selectedWaitlistCount)} />
      </div>

      <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
        <p className="text-sm font-medium text-foreground">{infoMessage}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les tableaux complets peuvent être demandés en liste d&apos;attente.
        </p>
      </div>

      {canChooseTables ? (
        <fieldset
          className="space-y-4"
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
                  {group.tables.length > 1 ? "x" : ""} proposé
                  {group.tables.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
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
                    <TableChoice
                      key={table.value}
                      isSelectable={isSelectable}
                      isSelected={isSelected}
                      isWaitlist={isWaitlist}
                      onToggle={() => toggleTable(table.value)}
                      onWaitlistChange={(checked) =>
                        handleWaitlistChange(table.value, checked)
                      }
                      table={table}
                    />
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
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          Le choix des tableaux s&apos;active dès que les points du joueur sont
          renseignés.
        </div>
      )}
    </section>
  );
}

function ReviewStep({
  formData,
  selectedTables,
  selectedWaitlistCount,
}: {
  formData: RegistrationPayload;
  selectedTables: TableOption[];
  selectedWaitlistCount: number;
}) {
  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <p className="text-sm font-semibold text-foreground">
          Joueur et contact
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <ReviewItem label="Joueur" value={formatPlayerName(formData)} />
          <ReviewItem label="Club" value={formData.club || "-"} />
          <ReviewItem label="Licence" value={formData.licenseNumber || "-"} />
          <ReviewItem label="Points" value={formData.points || "-"} />
          <ReviewItem label="E-mail" value={formData.email || "-"} />
          <ReviewItem label="Téléphone" value={formData.phone || "-"} />
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-background p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Tableaux demandés
          </p>
          {selectedWaitlistCount > 0 ? (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              {selectedWaitlistCount} liste
              {selectedWaitlistCount > 1 ? "s" : ""} d&apos;attente
            </span>
          ) : null}
        </div>

        {selectedTables.length > 0 ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {selectedTables.map((table) => {
              const isWaitlist = formData.waitlistTables.includes(table.value);

              return (
                <div
                  key={table.value}
                  className="rounded-lg border border-border/70 bg-muted/15 p-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {table.label}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    En ligne : {table.onlinePriceLabel} | Sur place :{" "}
                    {table.onsitePriceLabel}
                  </p>
                  <p
                    className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isWaitlist
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isWaitlist
                      ? "Liste d'attente demandée"
                      : "Sélection immédiate"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun tableau sélectionné pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}

function WizardSummary({
  formData,
  profileReady,
  readyToSubmit,
  selectedTables,
  selectedTotalCents,
}: {
  formData: RegistrationPayload;
  profileReady: boolean;
  readyToSubmit: boolean;
  selectedTables: TableOption[];
  selectedTotalCents: number;
}) {
  return (
    <div className="space-y-3 xl:sticky xl:top-20">
      <div className="rounded-lg border border-border/70 bg-background/80 p-3">
        <p className="text-sm font-semibold text-foreground">
          Votre dossier
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPlayerName(formData)}
        </p>


        <div className="mt-3 rounded-lg border border-border/70 bg-muted/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total estimé
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {(selectedTotalCents / 100).toFixed(0)} EUR
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-background/80 p-3">
        <p className="text-sm font-semibold text-foreground">
          Avancement
        </p>
        <div className="mt-3 space-y-2">
          <StatusLine label="Profil joueur" value={profileReady} />
          <StatusLine label="Tableaux" value={selectedTables.length > 0} />
          <StatusLine label="Prêt pour envoi" value={readyToSubmit} />
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-background/80 p-3">
        <p className="text-sm font-semibold text-foreground">
          Tableaux sélectionnés
        </p>
        {selectedTables.length > 0 ? (
          <div className="mt-3 space-y-2">
            {selectedTables.map((table) => (
              <div
                key={table.value}
                className="rounded-xl border border-border/70 bg-muted/15 px-3 py-2"
              >
                <p className="truncate text-sm font-medium text-foreground">
                  {table.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun tableau choisi.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldShell({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReadOnlyField({
  error,
  id,
  label,
  name,
  value,
}: {
  error?: string;
  id: string;
  label: string;
  name?: string;
  value: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2">
        <input
          id={id}
          name={name}
          readOnly
          required={Boolean(name)}
          value={value}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TableChoice({
  isSelectable,
  isSelected,
  isWaitlist,
  onToggle,
  onWaitlistChange,
  table,
}: {
  isSelectable: boolean;
  isSelected: boolean;
  isWaitlist: boolean;
  onToggle: () => void;
  onWaitlistChange: (checked: boolean) => void;
  table: TableOption;
}) {
  return (
    <div
      className={`rounded-lg border p-3 transition ${
        isSelected
          ? "border-primary/45 bg-primary/10 shadow-sm"
          : "border-border bg-background"
      } ${!isSelectable ? "bg-muted/50 text-muted-foreground" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {table.label}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-full border border-border/70 bg-muted/30 px-2 py-0.5 text-muted-foreground">
              En ligne {table.onlinePriceLabel}
            </span>
            <span className="rounded-full border border-border/70 bg-muted/30 px-2 py-0.5 text-muted-foreground">
              Sur place {table.onsitePriceLabel}
            </span>
          </div>
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

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {table.remainingSpots !== null && !table.isFull ? (
          <span>
            {table.remainingSpots} place{table.remainingSpots > 1 ? "s" : ""}{" "}
            restante{table.remainingSpots > 1 ? "s" : ""}
          </span>
        ) : null}
        <span>{table.dateLabel}</span>
      </div>

      {!isSelectable ? (
        <p className="mt-2 rounded-lg border border-border/80 bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
          Incompatible avec les informations saisies.
        </p>
      ) : null}

      {isSelectable && !table.isFull ? (
        <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm text-foreground transition hover:bg-muted/35">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="accent-primary"
          />
          <span className="leading-tight">
            {isSelected
              ? "Retirer ce tableau de ma sélection"
              : "Ajouter ce tableau à ma sélection"}
          </span>
        </label>
      ) : null}

      {isSelectable && table.isFull ? (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
          <p className="font-medium">Tableau complet.</p>
          <label className="mt-2 flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={isWaitlist}
              onChange={(event) => onWaitlistChange(event.target.checked)}
              className="mt-1 accent-primary"
            />
            <span>Liste d&apos;attente</span>
          </label>
        </div>
      ) : null}

      {isSelected ? (
        <p className="mt-2 text-[11px] font-medium text-foreground">
          {isWaitlist
            ? "Sélection en liste d'attente."
            : "Tableau ajouté au récapitulatif."}
        </p>
      ) : null}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <p className="rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-muted-foreground">
      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 block font-medium text-foreground">{value}</span>
    </p>
  );
}

function StatusLine({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          value
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {value ? (
          <CircleCheck className="h-3.5 w-3.5" />
        ) : (
          <CircleAlert className="h-3.5 w-3.5" />
        )}
        {value ? "OK" : "A faire"}
      </span>
    </div>
  );
}
