"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EventBlockForm = {
  eventTitle: string;
  eventEnabled: boolean;
};

export default function EventBlockEditor() {
  const [form, setForm] = useState<EventBlockForm>({
    eventTitle: "",
    eventEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/home-content");
        const json = await res.json();
        setForm({
          eventTitle: json?.data?.eventTitle ?? "",
          eventEnabled: Boolean(json?.data?.eventEnabled),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      alert("Bloc evenement mis a jour");
    } catch {
      alert("Erreur lors de la mise a jour");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardHeader>
        <CardTitle>Bloc evenement (Home)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
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
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="inline-flex w-fit items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </CardContent>
    </Card>
  );
}
