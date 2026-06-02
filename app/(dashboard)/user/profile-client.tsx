"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type FeedbackState = {
  tone: "success" | "error" | "info";
  message: string;
} | null;

export default function ProfileClient() {
  const { data: session, refetch } = authClient.useSession();
  const [name, setName] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const savedName = session?.user?.name?.trim() ?? "";
  const trimmedName = name.trim();
  const isDirty = trimmedName !== savedName;
  const hasValidationError =
    feedback?.tone === "error" && trimmedName.length === 0;
  const canSave =
    !!session && saveState !== "saving" && trimmedName.length > 0 && isDirty;

  useEffect(() => {
    setName(session?.user?.name ?? "");
  }, [session?.user?.name]);

  async function saveName() {
    if (!trimmedName) {
      setFeedback({
        tone: "error",
        message: "Le nom d'affichage est obligatoire.",
      });
      return;
    }

    if (!isDirty) {
      setFeedback({
        tone: "info",
        message: "Aucune modification à enregistrer.",
      });
      return;
    }

    setSaveState("saving");
    setFeedback(null);

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName }),
    });

    if (!response.ok) {
      setSaveState("idle");
      setFeedback({
        tone: "error",
        message: "Impossible d'enregistrer le profil pour le moment.",
      });
      return;
    }

    await refetch();
    setSaveState("idle");
    setFeedback({
      tone: "success",
      message: "Nom d'affichage mis à jour.",
    });
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(14rem,0.65fr)_minmax(0,1.35fr)] lg:items-center">
          <div className="flex items-center gap-3">
            <Image
              src={session?.user?.image || "/avatar-neutral.svg"}
              alt="Avatar"
              width={48}
              height={48}
              className="rounded-full border border-border bg-background"
            />
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {savedName || "Nom d'affichage non renseigné"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session
                  ? session.user.email
                  : "Connectez-vous pour modifier votre profil."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Nom d&apos;affichage
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (feedback) {
                      setFeedback(null);
                    }
                  }}
                  placeholder="Votre nom"
                  disabled={saveState === "saving" || !session}
                  aria-invalid={hasValidationError}
                  className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={saveName}
                  disabled={!canSave}
                  className="sm:min-w-32"
                >
                  {saveState === "saving" ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </label>
            <p className="text-xs text-muted-foreground">
              Utilisé dans votre espace membre et les vues associées.
            </p>
          </div>
        </div>

        {feedback || isDirty ? (
          <p
            className={`mt-3 text-xs ${
              feedback?.tone === "error"
                ? "text-destructive"
                : feedback?.tone === "success"
                  ? "text-emerald-600"
                  : "text-muted-foreground"
            }`}
            role="status"
            aria-live="polite"
          >
            {feedback?.message ?? "Modification non enregistrée."}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
