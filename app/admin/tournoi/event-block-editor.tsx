"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EventBlockForm = {
  eventTitle: string;
  eventEnabled: boolean;
  eventImageUrl: string;
  eventDateLabel: string;
};

export default function EventBlockEditor() {
  const [form, setForm] = useState<EventBlockForm>({
    eventTitle: "",
    eventEnabled: true,
    eventImageUrl: "",
    eventDateLabel: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/home-content");
        const json = await res.json();
        setForm({
          eventTitle: json?.data?.eventTitle ?? "",
          eventEnabled: Boolean(json?.data?.eventEnabled),
          eventImageUrl: json?.data?.eventImageUrl ?? "",
          eventDateLabel: json?.data?.eventDateLabel ?? "",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch("/api/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaveFeedback({
        type: "success",
        message: "Bloc evenement mis a jour.",
      });
    } catch {
      setSaveFeedback({
        type: "error",
        message: "Erreur lors de la mise a jour du bloc evenement.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-card/80 shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle>Bloc evenement (Home)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Modifiez le contenu du bloc mis en avant sur la page d&apos;accueil.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <label className="inline-flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={form.eventEnabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, eventEnabled: e.target.checked }))
            }
            disabled={loading}
          />
          Afficher le bloc evenement sur la home
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Titre</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.eventTitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, eventTitle: e.target.value }))
              }
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Libelle date</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.eventDateLabel}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, eventDateLabel: e.target.value }))
              }
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Image (URL)</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={form.eventImageUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, eventImageUrl: e.target.value }))
            }
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-background/60 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Apercu
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {form.eventEnabled ? form.eventTitle || "Evenement du club" : "Bloc masque"}
            </p>
            <p className="text-xs text-muted-foreground">
              {form.eventEnabled
                ? "Le bloc sera visible sur la home."
                : "Le bloc ne sera pas affiche."}
            </p>
            {form.eventEnabled && form.eventDateLabel ? (
              <p className="text-xs text-muted-foreground">
                {form.eventDateLabel}
              </p>
            ) : null}
          </div>

          <div className="flex min-w-[180px] flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>

            {saving ? (
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Enregistrement en cours...
              </div>
            ) : saveFeedback ? (
              <div
                className={`inline-flex items-center gap-2 text-xs ${
                  saveFeedback.type === "success"
                    ? "text-emerald-700"
                    : "text-destructive"
                }`}
              >
                {saveFeedback.type === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <TriangleAlert className="h-3.5 w-3.5" />
                )}
                {saveFeedback.message}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
