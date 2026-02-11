"use client";

import { FormEvent, useState } from "react";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

const initialFormData = {
  name: "",
  email: "",
  message: "",
  website: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

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
          payload.message ?? "Une erreur est survenue. Merci de réessayer."
        );
      }

      setFeedback({
        type: "success",
        message: payload.message ?? "Message envoyé avec succès.",
      });
      setFormData(initialFormData);
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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Votre nom"
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({ ...current, name: event.target.value }))
          }
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          maxLength={150}
          placeholder="votre@email.fr"
          value={formData.email}
          onChange={(event) =>
            setFormData((current) => ({ ...current, email: event.target.value }))
          }
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
          placeholder="Votre message…"
          value={formData.message}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              message: event.target.value,
            }))
          }
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
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
          className={`text-sm ${
            feedback.type === "success" ? "text-green-700" : "text-red-700"
          }`}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
