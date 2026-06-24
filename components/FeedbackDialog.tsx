"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bug, Check, Lightbulb, Loader2, Mail, MessageSquare, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FeedbackKind = "BUG" | "SUGGESTION";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

type FeedbackFormData = {
  kind: FeedbackKind;
  message: string;
  name: string;
  email: string;
  website: string;
};

const initialFormData: FeedbackFormData = {
  kind: "BUG",
  message: "",
  name: "",
  email: "",
  website: "",
};

const successCloseDelayMs = 1200;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(data: FeedbackFormData) {
  const errors: Partial<Record<"message" | "email", string>> = {};
  const message = data.message.trim();
  const email = data.email.trim();

  if (message.length < 10) {
    errors.message = "Ajoutez au moins 10 caracteres.";
  }

  if (message.length > 2000) {
    errors.message = "Le message doit rester sous 2000 caracteres.";
  }

  if (email && !emailPattern.test(email)) {
    errors.email = "Adresse email invalide.";
  }

  return errors;
}

export default function FeedbackDialog() {
  const pathname = usePathname();
  const successCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const errors = useMemo(() => validateForm(formData), [formData]);
  const currentPage =
    typeof window === "undefined"
      ? pathname ?? "/"
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const clearSuccessCloseTimer = useCallback(() => {
    if (successCloseTimerRef.current) {
      clearTimeout(successCloseTimerRef.current);
      successCloseTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearSuccessCloseTimer, [clearSuccessCloseTimer]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      clearSuccessCloseTimer();
      setFeedback((current) => (current?.type === "success" ? null : current));
    }
  }, [clearSuccessCloseTimer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearSuccessCloseTimer();
    setHasSubmitted(true);
    setFeedback(null);

    const nextErrors = validateForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        type: "error",
        message: "Vérifiez les champs avant d'envoyer.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          page: currentPage,
        }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Envoi impossible pour le moment.");
      }

      setFeedback({
        type: "success",
        message: payload.message ?? "Merci, votre retour a bien été envoyé.",
      });
      setFormData(initialFormData);
      setHasSubmitted(false);
      successCloseTimerRef.current = setTimeout(() => {
        setOpen(false);
        setFeedback(null);
        successCloseTimerRef.current = null;
      }, successCloseDelayMs);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le retour.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip className="fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5">
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-11 rounded-full border-primary/30 bg-background/88 p-0 text-primary shadow-md shadow-slate-950/10 backdrop-blur hover:border-primary/55 hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:bg-background/82 dark:text-primary dark:hover:border-primary/55 dark:hover:bg-primary/12 dark:hover:text-primary"
              aria-label="Signaler un bug ou proposer une suggestion"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent className="left-auto right-full mr-2 ml-0">
          Bug ou suggestion
        </TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-md p-5">
        <DialogHeader>
          <DialogTitle className="text-lg">Bug ou suggestion</DialogTitle>
          <DialogDescription>
            Envoyez un retour rapide au webmaster. La page actuelle sera jointe
            automatiquement.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <div
            className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-muted/30 p-1"
            role="group"
            aria-label="Type de retour"
          >
            <Button
              type="button"
              variant={formData.kind === "BUG" ? "default" : "ghost"}
              className="h-9 rounded-md"
              onClick={() =>
                setFormData((current) => ({ ...current, kind: "BUG" }))
              }
              aria-pressed={formData.kind === "BUG"}
            >
              <Bug className="h-4 w-4" />
              Bug
            </Button>
            <Button
              type="button"
              variant={formData.kind === "SUGGESTION" ? "default" : "ghost"}
              className="h-9 rounded-md"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  kind: "SUGGESTION",
                }))
              }
              aria-pressed={formData.kind === "SUGGESTION"}
            >
              <Lightbulb className="h-4 w-4" />
              Suggestion
            </Button>
          </div>

          <div>
            <label htmlFor="feedback-message" className="mb-1 block text-sm font-medium">
              Message
            </label>
            <div
              className={cn(
                "flex rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                hasSubmitted && errors.message && "border-destructive ring-destructive/20",
              )}
            >
              <div className="flex shrink-0 items-start border-r border-border/70 bg-muted/30 px-3 py-3 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
              <textarea
                id="feedback-message"
                rows={5}
                required
                minLength={10}
                maxLength={2000}
                className="min-h-32 w-full resize-y bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Expliquez rapidement ce que vous avez vu ou ce que vous proposez..."
                value={formData.message}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                aria-invalid={hasSubmitted && errors.message ? "true" : "false"}
                aria-describedby={
                  hasSubmitted && errors.message ? "feedback-message-error" : undefined
                }
              />
            </div>
            {hasSubmitted && errors.message ? (
              <p id="feedback-message-error" className="form-error" role="alert">
                {errors.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="feedback-name" className="mb-1 block text-sm font-medium">
                Nom
              </label>
              <div className="flex min-h-10 overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
                <div className="flex shrink-0 items-center border-r border-border/70 bg-muted/30 px-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="feedback-name"
                  type="text"
                  maxLength={100}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Optionnel"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor="feedback-email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <div
                className={cn(
                  "flex min-h-10 overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                  hasSubmitted && errors.email && "border-destructive ring-destructive/20",
                )}
              >
                <div className="flex shrink-0 items-center border-r border-border/70 bg-muted/30 px-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="feedback-email"
                  type="email"
                  maxLength={150}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Optionnel"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  aria-invalid={hasSubmitted && errors.email ? "true" : "false"}
                  aria-describedby={
                    hasSubmitted && errors.email ? "feedback-email-error" : undefined
                  }
                />
              </div>
              {hasSubmitted && errors.email ? (
                <p id="feedback-email-error" className="form-error" role="alert">
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="feedback-website">Site web</label>
            <input
              id="feedback-website"
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
                feedback.type === "success"
                  ? "text-primary"
                  : "text-destructive"
              }`}
              role={feedback.type === "success" ? "status" : "alert"}
            >
              {feedback.type === "success" ? <Check className="h-4 w-4" /> : null}
              {feedback.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </span>
              ) : (
                "Envoyer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
