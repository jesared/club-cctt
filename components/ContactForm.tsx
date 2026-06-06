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
import {
  type ContactSubject,
  normalizeContactSubject,
  contactSubjectOptions,
} from "@/lib/contact-subjects";

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
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nom
        </label>
        <div className="form-input-group">
          <User className="form-input-group__icon h-4 w-4" aria-hidden="true" />
          <input
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
            className="form-field"
          />
        </div>
        {fieldErrors.name ? (
          <p id="name-error" className="form-error" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-mail
        </label>
        <div className="form-input-group">
          <Mail className="form-input-group__icon h-4 w-4" aria-hidden="true" />
          <input
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
            className="form-field"
          />
        </div>
        {fieldErrors.email ? (
          <p id="email-error" className="form-error" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium">
          Sujet
        </label>
        <div className="form-input-group">
          <ListChecks
            className="form-input-group__icon h-4 w-4"
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
          className="form-field"
        >
          <option value="">Sélectionnez un sujet</option>
          {contactSubjectOptions.map((option) => (
            <option key={option} value={option}>
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
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <div className="form-input-group">
          <MessageSquareText
            className="form-input-group__icon form-input-group__icon--textarea h-4 w-4"
            aria-hidden="true"
          />
          <textarea
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
            className="form-field"
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
        className="focus-ring active:scale-[0.98]"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </span>
        ) : (
          "Envoyer le message"
        )}
      </Button>
    </form>
  );
}
