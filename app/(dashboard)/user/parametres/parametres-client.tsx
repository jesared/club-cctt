"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SaveState = "idle" | "saving" | "success" | "error";

export default function ParametresClient() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notifyTournament, setNotifyTournament] = useState(true);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  useEffect(() => {
    const stored = localStorage.getItem("user.notifyTournament");
    if (stored !== null) {
      setNotifyTournament(stored === "true");
    }
  }, []);

  async function saveProfile() {
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

  function saveNotifications() {
    localStorage.setItem("user.notifyTournament", String(notifyTournament));
    setSaveState("success");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={session?.user?.image || "/avatar-neutral.svg"}
                alt="Avatar"
                width={48}
                height={48}
                className="rounded-full border border-border bg-background"
              />
              <div>
                <CardTitle>Profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de base.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={saveProfile}
              disabled={status !== "authenticated" || saveState === "saving"}
            >
              {saveState === "saving" ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Votre nom"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
            />
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={session?.user?.email ?? ""}
              readOnly
              className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
            {saveState === "success" ? (
              <p className="text-xs text-emerald-500">Profil mis à jour.</p>
            ) : null}
            {saveState === "error" ? (
              <p className="text-xs text-destructive">
                Impossible d'enregistrer. Vérifiez le nom.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choisissez les emails que vous souhaitez recevoir.
              </CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={saveNotifications}>
              Enregistrer
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
              <span>
                <span className="block font-medium text-foreground">
                  Relances paiement tournoi
                </span>
                <span className="block text-xs text-muted-foreground">
                  Recevoir les rappels si un paiement est en attente.
                </span>
              </span>
              <input
                type="checkbox"
                checked={notifyTournament}
                onChange={(event) => setNotifyTournament(event.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Ces préférences sont enregistrées sur cet appareil.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
