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
  defaultComiteContent,
  type ComiteData,
  type ComiteResponse,
  type SimpleMember,
} from "@/lib/comite-content";

const emptyBenevole: SimpleMember = {
  nom: "",
  description: "",
  photo: "",
};

function ImagePreview({ photo, alt }: { photo: string; alt: string }) {
  if (!photo) {
    return (
      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        Ajoutez une photo pour l&apos;aperçu.
      </div>
    );
  }

  return (
    <div
      className="h-40 w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${photo})` }}
      aria-label={alt}
      role="img"
    />
  );
}

function cleanComiteForm(form: ComiteData): ComiteData {
  return {
    bureau: form.bureau.map((member) => ({
      poste: member.poste,
      nom: member.nom,
      description: member.description ?? "",
      photo: member.photo,
    })),
    membres: form.membres.map((member) => ({
      nom: member.nom,
      description: member.description ?? "",
      photo: member.photo,
    })),
    salaries: form.salaries.map((member) => ({
      nom: member.nom,
      description: member.description ?? "",
      photo: member.photo,
    })),
    benevoles: form.benevoles.map((member) => ({
      nom: member.nom,
      description: member.description ?? "",
      photo: member.photo,
    })),
  };
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Jamais mis a jour";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminBenevolesPage() {
  const [form, setForm] = useState<ComiteData>(defaultComiteContent);
  const [meta, setMeta] = useState<ComiteResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/comite");
        const json = (await res.json()) as ComiteResponse;
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
      const nextForm = cleanComiteForm(form);
      const res = await fetch("/api/comite", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextForm),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const json = (await res.json()) as ComiteResponse;
      setForm(json.data);
      setMeta(json.meta);
      alert("Benevoles mis a jour.");
    } catch {
      alert("Erreur lors de l'enregistrement des benevoles.");
    } finally {
      setSaving(false);
    }
  }

  function updateBenevole<K extends keyof SimpleMember>(
    index: number,
    field: K,
    value: SimpleMember[K],
  ) {
    setForm((current) => ({
      ...current,
      benevoles: current.benevoles.map((member, currentIndex) =>
        currentIndex === index ? { ...member, [field]: value } : member,
      ),
    }));
  }

  function addBenevole() {
    setForm((current) => ({
      ...current,
      benevoles: [...current.benevoles, { ...emptyBenevole }],
    }));
  }

  function removeBenevole(index: number) {
    setForm((current) => ({
      ...current,
      benevoles: current.benevoles.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  }

  function moveBenevole(index: number, direction: -1 | 1) {
    setForm((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.benevoles.length) {
        return current;
      }

      const nextBenevoles = [...current.benevoles];
      const [member] = nextBenevoles.splice(index, 1);
      nextBenevoles.splice(targetIndex, 0, member);

      return { ...current, benevoles: nextBenevoles };
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Entraineurs benevoles</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Modifiez ici les bénévoles affichés sur la page publique
              /club/entraineurs-benevoles.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/comite-directeur">Modifier le comite</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/club/entraineurs-benevoles">
                Voir la page publique
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-base">Source benevoles</CardTitle>
            <CardDescription>
              Les modifications enregistrees ici utilisent la même source de
              données que le comité et les salariés.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <p>
              Dernière mise a jour connue :{" "}
              {formatUpdatedAt(meta?.updatedAt ?? null)}
            </p>
            <p>{loading ? "Chargement..." : "Contenu prêt a être edite."}</p>
          </CardContent>
        </Card>
      </header>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Équipe benevole</CardTitle>
              <CardDescription>
                Ajoutez un nom, une description et une photo pour chaque
                bénévole affiché sur la page publique.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addBenevole}>
              <Plus className="h-4 w-4" />
              Ajouter un bénévole
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.benevoles.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Aucun bénévole pour le moment.
              </div>
            ) : null}

            {form.benevoles.map((member, index) => (
              <div
                key={`benevole-${index}`}
                className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_180px]"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nom</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="Nom du bénévole"
                      value={member.nom}
                      onChange={(event) =>
                        updateBenevole(index, "nom", event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full rounded border px-3 py-2"
                      rows={3}
                      value={member.description ?? ""}
                      onChange={(event) =>
                        updateBenevole(index, "description", event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Photo (URL ou chemin `/public`)
                    </label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="/comite/photo.jpg"
                      value={member.photo}
                      onChange={(event) =>
                        updateBenevole(index, "photo", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="overflow-hidden rounded-xl border bg-muted/20">
                    <ImagePreview
                      photo={member.photo}
                      alt={`Previsualisation de ${member.nom || "la photo"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveBenevole(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveBenevole(index, 1)}
                      disabled={index === form.benevoles.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Descendre
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeBenevole(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Les lignes vides seront automatiquement ignorees a
            l&apos;enregistrement.
          </p>

          <Button type="submit" disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer les benevoles"}
          </Button>
        </div>
      </form>
    </div>
  );
}
