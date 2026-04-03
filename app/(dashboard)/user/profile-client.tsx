"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileClient() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState<string>("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  async function saveName() {
    if (!name.trim()) {
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      setSaveState("error");
      return;
    }

    await update({ name: name.trim() });
    setSaveState("success");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={session?.user?.image || "/avatar-neutral.svg"}
            alt="Avatar"
            width={56}
            height={56}
            className="rounded-full border border-border bg-background"
          />
          <div>
            <CardTitle className="text-lg">
              {status === "authenticated" ? session.user.email : "Mon profil"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Personnalisez votre nom affiche dans l&apos;espace membre.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={saveName}
          disabled={saveState === "saving" || status !== "authenticated"}
        >
          {saveState === "saving" ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Nom d&apos;affichage
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Votre nom"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
        {saveState === "success" ? (
          <p className="text-xs text-emerald-500">Nom mis a jour.</p>
        ) : null}
        {saveState === "error" ? (
          <p className="text-xs text-destructive">
            Impossible d&apos;enregistrer. Verifiez le champ.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
