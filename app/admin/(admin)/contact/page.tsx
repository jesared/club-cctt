"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ContactContentData } from "@/lib/contact-content";
import { defaultContactContent } from "@/lib/contact-content";

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactContentData>(defaultContactContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/contact-content");
        const json = await res.json();
        setForm((current) => ({ ...current, ...json.data }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contact-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      alert("Contact mis à jour");
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ContactContentData>(
    key: K,
    value: ContactContentData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Contact - contenu</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez le contenu affiché sur la page Contact.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>En-tête</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Badge</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Texte d&apos;intro</label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={3}
                value={form.intro}
                onChange={(e) => updateField("intro", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Délai de réponse</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.responseDelay}
                onChange={(e) => updateField("responseDelay", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Lieu</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.addressName}
                onChange={(e) => updateField("addressName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nom du club</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.addressLine}
                onChange={(e) => updateField("addressLine", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Ville</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.addressCity}
                onChange={(e) => updateField("addressCity", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liens CTA</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">CTA primaire - label</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaPrimaryLabel}
                onChange={(e) => updateField("ctaPrimaryLabel", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">CTA primaire - lien</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaPrimaryHref}
                onChange={(e) => updateField("ctaPrimaryHref", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">CTA secondaire - label</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaSecondaryLabel}
                onChange={(e) =>
                  updateField("ctaSecondaryLabel", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">CTA secondaire - lien</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaSecondaryHref}
                onChange={(e) =>
                  updateField("ctaSecondaryHref", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <button
          type="submit"
          disabled={saving || loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
