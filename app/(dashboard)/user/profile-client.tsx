"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import {
  canAccessBureauSpace,
  canAccessClubSpace,
  canAccessEntraineurSpace,
  getRoleLabel,
} from "@/lib/roles";

type FeedbackState = {
  tone: "success" | "error" | "info";
  message: string;
} | null;

export default function ProfileClient() {
  const { data: session, refetch } = authClient.useSession();
  const [name, setName] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const savedName = useMemo(
    () => session?.user?.name?.trim() ?? "",
    [session?.user?.name],
  );
  const trimmedName = name.trim();
  const isDirty = trimmedName !== savedName;
  const hasValidationError =
    feedback?.tone === "error" && trimmedName.length === 0;
  const roleLabel = getRoleLabel(session?.user?.role);
  const canAccessClub = canAccessClubSpace(session?.user?.role);
  const canAccessBureau = canAccessBureauSpace(session?.user?.role);
  const canAccessEntraineur = canAccessEntraineurSpace(session?.user?.role);
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
        message: "Aucune modification a enregistrer.",
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
      message: "Nom d'affichage mis a jour.",
    });
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={session?.user?.image || "/avatar-neutral.svg"}
              alt="Avatar"
              width={56}
              height={56}
              className="rounded-full border border-border bg-background"
            />
            <div className="space-y-1">
              <CardTitle className="text-lg">Mon profil</CardTitle>
              <p className="text-sm font-medium text-foreground">
                {savedName || "Nom d'affichage non renseigne"}
              </p>
              <p className="text-sm text-muted-foreground">
                {session
                  ? session.user.email
                  : "Connectez-vous pour modifier votre profil."}
              </p>
              {session ? (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge className="border-amber-300/70 bg-amber-300 text-amber-950 hover:bg-amber-300/90">
                    Role: {roleLabel}
                  </Badge>
                  {canAccessClub ? (
                    <Badge className="border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/20">
                      Club
                    </Badge>
                  ) : null}
                  {canAccessBureau ? (
                    <Badge className="border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/20">
                      Bureau
                    </Badge>
                  ) : null}
                  {canAccessEntraineur ? (
                    <Badge className="border-violet-300 bg-violet-100 text-violet-800 hover:bg-violet-200 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-200 dark:hover:bg-violet-500/20">
                      Entraîneur
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {isDirty ? "Modifications non enregistrees" : "Profil a jour"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nom d&apos;affichage
            </span>
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
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Ce nom sera affiche dans votre espace membre et dans les vues
              associees a votre compte.
            </p>
          </label>

          <Button
            type="button"
            variant="secondary"
            onClick={saveName}
            disabled={!canSave}
            className="lg:min-w-40"
          >
            {saveState === "saving" ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback?.tone === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : feedback?.tone === "success"
                ? "border-emerald-300/40 bg-emerald-500/5 text-emerald-600"
                : "border-border/70 bg-muted/20 text-muted-foreground"
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback?.message ??
            (isDirty
              ? "Votre nouveau nom est pret a etre enregistre."
              : "Aucune modification en attente sur votre profil.")}
        </div>
      </CardContent>
    </Card>
  );
}
