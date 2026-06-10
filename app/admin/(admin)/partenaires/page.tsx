"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  defaultPartenairesContent,
  resolvePartenaireLogoSrc,
  type Partenaire,
  type PartenairesData,
  type PartenairesResponse,
} from "@/lib/partenaires-content";

const emptyPartenaire: Partenaire = {
  nom: "",
  description: "",
  logo: "",
  url: "",
};

function getMetaLabel(meta: PartenairesResponse["meta"] | null) {
  if (!meta) {
    return "Chargement en cours";
  }

  if (meta.source === "admin") {
    return "Source active : administration du site";
  }

  if (meta.source === "drive") {
    return meta.stale
      ? "Source active : cache Drive"
      : "Source active : Drive";
  }

  return "Source active : contenu de secours";
}

function getMetaHelp(meta: PartenairesResponse["meta"] | null) {
  if (!meta) {
    return "Récupération des partenaires actuels.";
  }

  if (meta.source === "admin") {
    return "Les modifications enregistrées ici sont déjà prioritaires sur la page publique.";
  }

  if (meta.source === "drive") {
    return "Au premier enregistrement ici, le site utilisera cette version admin à la place de Drive.";
  }

  return "Aucune source distante valide n'a été trouvée. Vous pouvez reconstruire les partenaires ici.";
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Jamais mis à jour";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

export default function AdminPartenairesPage() {
  const [form, setForm] = useState<PartenairesData>(defaultPartenairesContent);
  const [meta, setMeta] = useState<PartenairesResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/partenaires");
        const json = (await res.json()) as PartenairesResponse;
        setForm(json.data);
        setMeta(json.meta);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/partenaires", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const json = (await res.json()) as PartenairesResponse;
      setForm(json.data);
      setMeta(json.meta);
      alert("Partenaires mis à jour.");
    } catch {
      alert("Erreur lors de l'enregistrement des partenaires.");
    } finally {
      setSaving(false);
    }
  }

  function addPartenaire(key: "institutionnels" | "prives") {
    setForm((current) => ({
      ...current,
      [key]: [...current[key], { ...emptyPartenaire }],
    }));
  }

  function removePartenaire(
    key: "institutionnels" | "prives",
    index: number,
  ) {
    setForm((current) => ({
      ...current,
      [key]: current[key].filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function movePartenaire(
    key: "institutionnels" | "prives",
    index: number,
    direction: -1 | 1,
  ) {
    setForm((current) => ({
      ...current,
      [key]: moveItem(current[key], index, direction),
    }));
  }

  function updatePartenaireField<K extends keyof Partenaire>(
    key: "institutionnels" | "prives",
    index: number,
    field: K,
    value: Partenaire[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: current[key].map((partenaire, currentIndex) =>
        currentIndex === index ? { ...partenaire, [field]: value } : partenaire,
      ),
    }));
  }

  function renderSection(
    key: "institutionnels" | "prives",
    title: string,
    description: string,
  ) {
    const items = form[key];

    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => addPartenaire(key)}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
              Aucun partenaire dans cette section pour le moment.
            </div>
          ) : null}

          {items.map((partenaire, index) => (
            <div
              key={`${key}-${index}`}
              className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_180px]"
            >
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nom</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      value={partenaire.nom}
                      onChange={(event) =>
                        updatePartenaireField(
                          key,
                          index,
                          "nom",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Lien</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="https://..."
                      value={partenaire.url ?? ""}
                      onChange={(event) =>
                        updatePartenaireField(
                          key,
                          index,
                          "url",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full rounded border px-3 py-2"
                    rows={3}
                    value={partenaire.description}
                    onChange={(event) =>
                      updatePartenaireField(
                        key,
                        index,
                        "description",
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Logo (ID Drive, URL ou chemin `/public`)
                  </label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="/partenaires/logo.svg"
                    value={partenaire.logo}
                    onChange={(event) =>
                      updatePartenaireField(
                        key,
                        index,
                        "logo",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-xl border bg-muted/20 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvePartenaireLogoSrc(partenaire.logo)}
                    alt={partenaire.nom || "Logo partenaire"}
                    className="h-28 w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => movePartenaire(key, index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Monter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => movePartenaire(key, index, 1)}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                    Descendre
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removePartenaire(key, index)}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Partenaires</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Modifiez ici les partenaires affichés sur la page publique
              `/club/partenaires`, sans passer par Drive.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/club/partenaires">Voir la page publique</Link>
          </Button>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-base">{getMetaLabel(meta)}</CardTitle>
            <CardDescription>{getMetaHelp(meta)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <p>
              Dernière mise à jour connue :{" "}
              {formatUpdatedAt(meta?.updatedAt ?? null)}
            </p>
            <p>{loading ? "Chargement..." : "Contenu prêt à être édité."}</p>
          </CardContent>
        </Card>
      </header>

      <form onSubmit={submit} className="space-y-6">
        {renderSection(
          "institutionnels",
          "Partenaires institutionnels",
          "Collectivités, fédérations et organismes publics ou associatifs.",
        )}

        {renderSection(
          "prives",
          "Partenaires privés",
          "Entreprises, commerces et sponsors qui soutiennent le club.",
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Les fiches vides seront automatiquement ignorées à l&apos;enregistrement.
          </p>

          <Button type="submit" disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer les partenaires"}
          </Button>
        </div>
      </form>
    </div>
  );
}
