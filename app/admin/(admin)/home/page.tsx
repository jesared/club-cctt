"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { HomeContentData } from "@/lib/home-content";
import { defaultHomeContent } from "@/lib/home-content";

export default function AdminHomePage() {
  const [form, setForm] = useState<HomeContentData>(defaultHomeContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const heroImageUrl = form.heroImageUrl.trim();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/home-content");
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
      const res = await fetch("/api/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      alert("Home mise a jour");
    } catch {
      alert("Erreur lors de la mise a jour");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof HomeContentData>(
    key: K,
    value: HomeContentData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Home - contenu</h1>
        <p className="text-sm text-muted-foreground">
          Modifiez les textes et l&apos;image de la page d&apos;accueil.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Sous-titre</label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={2}
                value={form.heroSubtitle}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Image (URL)</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.heroImageUrl}
                onChange={(e) => updateField("heroImageUrl", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">CTA - label</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.heroCtaLabel}
                onChange={(e) => updateField("heroCtaLabel", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">CTA - lien</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.heroCtaHref}
                onChange={(e) => updateField("heroCtaHref", e.target.value)}
              />
            </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Aperçu image</label>
              <div className="overflow-hidden rounded-xl border bg-muted/20">
                {heroImageUrl ? (
                  <div
                    className="h-48 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImageUrl})` }}
                    aria-label="Aperçu de l'image hero"
                    role="img"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    Ajoutez une URL pour afficher l&apos;aperçu.
                  </div>
                )}
              </div>
              <p className="break-all text-xs text-muted-foreground">
                {heroImageUrl || "Aucune URL renseignée."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bloc bienvenue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.welcomeTitle}
                onChange={(e) => updateField("welcomeTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Texte 1</label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={2}
                value={form.welcomeText1}
                onChange={(e) => updateField("welcomeText1", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Texte 2</label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={2}
                value={form.welcomeText2}
                onChange={(e) => updateField("welcomeText2", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              ["highlight1Title", "highlight1Text", "Highlight 1"],
              ["highlight2Title", "highlight2Text", "Highlight 2"],
              ["highlight3Title", "highlight3Text", "Highlight 3"],
            ].map(([titleKey, textKey, label]) => (
              <div key={label} className="grid gap-2">
                <label className="text-sm font-medium">{label} - titre</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={form[titleKey as keyof HomeContentData] as string}
                  onChange={(e) =>
                    updateField(
                      titleKey as keyof HomeContentData,
                      e.target.value,
                    )
                  }
                />
                <label className="text-sm font-medium">{label} - texte</label>
                <textarea
                  className="w-full rounded border px-3 py-2"
                  rows={2}
                  value={form[textKey as keyof HomeContentData] as string}
                  onChange={(e) =>
                    updateField(
                      textKey as keyof HomeContentData,
                      e.target.value,
                    )
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bloc CTA</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaTitle}
                onChange={(e) => updateField("ctaTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Texte</label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={2}
                value={form.ctaText}
                onChange={(e) => updateField("ctaText", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bouton - label</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaButtonLabel}
                onChange={(e) => updateField("ctaButtonLabel", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bouton - lien</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.ctaButtonHref}
                onChange={(e) => updateField("ctaButtonHref", e.target.value)}
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
