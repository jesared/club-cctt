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
  type BureauMember,
  type ComiteData,
  type ComiteResponse,
  type SimpleMember,
} from "@/lib/comite-content";

const emptyBureauMember: BureauMember = {
  poste: "",
  nom: "",
  description: "",
  photo: "",
};

const emptySimpleMember: SimpleMember = {
  nom: "",
  description: "",
  photo: "",
};

function getMetaLabel(meta: ComiteResponse["meta"] | null) {
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

function getMetaHelp(meta: ComiteResponse["meta"] | null) {
  if (!meta) {
    return "Recuperation des donnees actuelles du comite.";
  }

  if (meta.source === "admin") {
    return "Les modifications enregistrees ici sont déjà prioritaires sur la page publique.";
  }

  if (meta.source === "drive") {
    return "Au premier enregistrement ici, le site utilisera cette version admin a la place de Drive.";
  }

  return "Aucune source distante valide n'a été trouvee. Vous pouvez reconstruire le contenu ici.";
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

function ImagePreview({
  photo,
  alt,
}: {
  photo: string;
  alt: string;
}) {
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

export default function AdminComiteDirecteurPage() {
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
      alert("Comite directeur mis a jour.");
    } catch {
      alert("Erreur lors de l'enregistrement du comite directeur.");
    } finally {
      setSaving(false);
    }
  }

  function updateBureauMember<K extends keyof BureauMember>(
    index: number,
    key: K,
    value: BureauMember[K],
  ) {
    setForm((current) => ({
      ...current,
      bureau: current.bureau.map((member, currentIndex) =>
        currentIndex === index ? { ...member, [key]: value } : member,
      ),
    }));
  }

  function updateComiteMember<K extends keyof SimpleMember>(
    index: number,
    field: K,
    value: SimpleMember[K],
  ) {
    setForm((current) => ({
      ...current,
      membres: current.membres.map((member, currentIndex) =>
        currentIndex === index ? { ...member, [field]: value } : member,
      ),
    }));
  }

  function addBureauMember() {
    setForm((current) => ({
      ...current,
      bureau: [...current.bureau, { ...emptyBureauMember }],
    }));
  }

  function addComiteMember() {
    setForm((current) => ({
      ...current,
      membres: [...current.membres, { ...emptySimpleMember }],
    }));
  }

  function removeBureauMember(index: number) {
    setForm((current) => ({
      ...current,
      bureau: current.bureau.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function removeComiteMember(index: number) {
    setForm((current) => ({
      ...current,
      membres: current.membres.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  }

  function moveBureauMember(index: number, direction: -1 | 1) {
    setForm((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.bureau.length) {
        return current;
      }

      const nextBureau = [...current.bureau];
      const [member] = nextBureau.splice(index, 1);
      nextBureau.splice(targetIndex, 0, member);

      return { ...current, bureau: nextBureau };
    });
  }

  function moveComiteMember(index: number, direction: -1 | 1) {
    setForm((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.membres.length) {
        return current;
      }

      const nextMembers = [...current.membres];
      const [member] = nextMembers.splice(index, 1);
      nextMembers.splice(targetIndex, 0, member);

      return { ...current, membres: nextMembers };
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Comite directeur</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Modifiez ici les personnes affichees sur la page publique
              /club/comite-directeur, sans passer par Drive.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/salaries">Modifier les salaries</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/club/comite-directeur">Voir la page publique</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-base">{getMetaLabel(meta)}</CardTitle>
            <CardDescription>{getMetaHelp(meta)}</CardDescription>
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
              <CardTitle>Bureau</CardTitle>
              <CardDescription>
                President, tresorier, secretaire et autres postes avec photo.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addBureauMember}>
              <Plus className="h-4 w-4" />
              Ajouter un membre
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.bureau.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Aucun membre du bureau pour le moment.
              </div>
            ) : null}

            {form.bureau.map((member, index) => (
              <div
                key={`bureau-${index}`}
                className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_180px]"
              >
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Poste</label>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={member.poste}
                        onChange={(event) =>
                          updateBureauMember(index, "poste", event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Nom</label>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={member.nom}
                        onChange={(event) =>
                          updateBureauMember(index, "nom", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full rounded border px-3 py-2"
                      rows={3}
                      value={member.description ?? ""}
                      onChange={(event) =>
                        updateBureauMember(
                          index,
                          "description",
                          event.target.value,
                        )
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
                        updateBureauMember(index, "photo", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="overflow-hidden rounded-xl border bg-muted/20">
                    <ImagePreview
                      photo={member.photo}
                      alt={`Previsualisation de ${member.nom || member.poste || "la photo"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveBureauMember(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveBureauMember(index, 1)}
                      disabled={index === form.bureau.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Descendre
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeBureauMember(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Membres du comite</CardTitle>
              <CardDescription>
                Ajoutez un nom et une photo pour les autres membres affiches sur la page.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addComiteMember}
            >
              <Plus className="h-4 w-4" />
              Ajouter un groupe
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.membres.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Aucun membre du comite pour le moment.
              </div>
            ) : null}

            {form.membres.map((member, index) => (
              <div
                key={`membre-${index}`}
                className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_180px]"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nom</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="Nom du membre"
                      value={member.nom}
                      onChange={(event) =>
                        updateComiteMember(
                          index,
                          "nom",
                          event.target.value,
                        )
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
                        updateComiteMember(
                          index,
                          "description",
                          event.target.value,
                        )
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
                        updateComiteMember(
                          index,
                          "photo",
                          event.target.value,
                        )
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
                      onClick={() => moveComiteMember(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveComiteMember(index, 1)}
                      disabled={index === form.membres.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Descendre
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeComiteMember(index)}
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
            Les lignes vides seront automatiquement ignorees a l&apos;enregistrement.
          </p>

          <Button type="submit" disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer le comite"}
          </Button>
        </div>
      </form>
    </div>
  );
}
