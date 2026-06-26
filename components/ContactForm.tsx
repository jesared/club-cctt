"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ListChecks,
  Loader2,
  Mail,
  MessageSquareText,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ctaToneClasses } from "@/lib/cta-theme";
import {
  type ContactSubject,
  normalizeContactSubject,
  contactSubjectOptions,
} from "@/lib/contact-subjects";
import { cn } from "@/lib/utils";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactField = "name" | "email" | "subject" | "message";
type FieldErrors = Partial<Record<ContactField, string>>;
type FieldTouched = Partial<Record<ContactField, boolean>>;

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formControlStateClassName =
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

function validateField(field: ContactField, value: string) {
  const trimmedValue = value.trim();

  switch (field) {
    case "name":
      if (!trimmedValue) {
        return "Indiquez votre nom.";
      }
      if (trimmedValue.length < 2) {
        return "Le nom doit contenir au moins 2 caractères.";
      }
      return undefined;
    case "email":
      if (!trimmedValue) {
        return "Indiquez votre adresse e-mail.";
      }
      if (!emailPattern.test(trimmedValue)) {
        return "Saisissez une adresse e-mail valide.";
      }
      return undefined;
    case "subject":
      if (!trimmedValue) {
        return "Sélectionnez le sujet de votre demande.";
      }
      return undefined;
    case "message":
      if (!trimmedValue) {
        return "Décrivez votre demande en quelques mots.";
      }
      if (trimmedValue.length < 10) {
        return "Le message doit contenir au moins 10 caractères.";
      }
      return undefined;
    default:
      return undefined;
  }
}

function validateForm(data: ContactFormData) {
  const errors: FieldErrors = {};

  for (const field of ["name", "email", "subject", "message"] as const) {
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

type ContactFormProps = {
  initialSubject?: ContactSubject | "";
};

export default function ContactForm({
  initialSubject = "",
}: ContactFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<FieldTouched>({});

  const errorCount = useMemo(
    () => Object.values(fieldErrors).filter(Boolean).length,
    [fieldErrors],
  );

  useEffect(() => {
    const nextSubject = normalizeContactSubject(initialSubject);

    setFormData((current) =>
      current.subject === nextSubject
        ? current
        : { ...current, subject: nextSubject },
    );

    setFieldErrors((current) => ({
      ...current,
      subject: undefined,
    }));
  }, [initialSubject]);

  const setFieldValue = (field: ContactField, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (touchedFields[field] || hasSubmitted) {
      setFieldErrors((current) => ({
        ...current,
        [field]: validateField(field, value),
      }));
    }
  };

  const markFieldAsTouched = (field: ContactField) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, formData[field]),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setFeedback(null);

    const nextErrors = validateForm(formData);
    setFieldErrors(nextErrors);
    setTouchedFields({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        type: "error",
        message:
          "Vérifiez les champs signalés avant d'envoyer votre message.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(
          payload.message ?? "Une erreur est survenue. Merci de réessayer.",
        );
      }

      setFeedback({
        type: "success",
        message: payload.message ?? "Message envoyé avec succès.",
      });
      setFormData({
        ...initialFormData,
        subject: normalizeContactSubject(initialSubject),
      });
      setFieldErrors({});
      setTouchedFields({});
      setHasSubmitted(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={`space-y-6 ${hasSubmitted ? "form-submitted" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <p className="form-hint">
        Tous les champs ci-dessous sont obligatoires.
      </p>

      <div>
        <Label htmlFor="name" className="mb-1 block">
          Nom
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Votre nom"
            value={formData.name}
            onChange={(event) => setFieldValue("name", event.target.value)}
            onBlur={() => markFieldAsTouched("name")}
            aria-invalid={fieldErrors.name ? "true" : "false"}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={cn("pl-10", formControlStateClassName)}
          />
        </div>
        {fieldErrors.name ? (
          <p id="name-error" className="form-error" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="email" className="mb-1 block">
          E-mail
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="email"
            id="email"
            name="email"
            required
            maxLength={150}
            placeholder="votre@email.fr"
            value={formData.email}
            onChange={(event) => setFieldValue("email", event.target.value)}
            onBlur={() => markFieldAsTouched("email")}
            aria-invalid={fieldErrors.email ? "true" : "false"}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={cn("pl-10", formControlStateClassName)}
          />
        </div>
        {fieldErrors.email ? (
          <p id="email-error" className="form-error" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="subject" className="mb-1 block">
          Sujet
        </Label>
        <div className="relative">
          <ListChecks
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={(event) => setFieldValue("subject", event.target.value)}
            onBlur={() => markFieldAsTouched("subject")}
            aria-invalid={fieldErrors.subject ? "true" : "false"}
            aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              formControlStateClassName,
              !formData.subject && "text-muted-foreground",
            )}
          >
            <option className="bg-card text-foreground" value="">Sélectionnez un sujet</option>
            {contactSubjectOptions.map((option) => (
              <option className="bg-card text-foreground" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {fieldErrors.subject ? (
          <p id="subject-error" className="form-error" role="alert">
            {fieldErrors.subject}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="message" className="mb-1 block">
          Message
        </Label>
        <div className="relative">
          <MessageSquareText
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Textarea
            id="message"
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={5000}
            placeholder="Votre message..."
            value={formData.message}
            onChange={(event) => setFieldValue("message", event.target.value)}
            onBlur={() => markFieldAsTouched("message")}
            aria-invalid={fieldErrors.message ? "true" : "false"}
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
            className={cn("min-h-32 pl-10", formControlStateClassName)}
          />
        </div>
        {fieldErrors.message ? (
          <p id="message-error" className="form-error" role="alert">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input
          type="text"
          id="website"
          name="website"
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
            ? ` (${errorCount} champ${errorCount > 1 ? "s" : ""} à corriger)`
            : null}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={`${ctaToneClasses.contact.primaryButton} active:scale-[0.98]`}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 data-icon="inline-start" className="animate-spin" />
            Envoi en cours...
          </span>
        ) : (
          "Envoyer ma demande"
        )}
      </Button>
    </form>
  );
}
