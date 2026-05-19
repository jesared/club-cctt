"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  badgeVariants,
  defaultHorairesContent,
  type BadgeVariant,
  type HorairesData,
  type HorairesResponse,
} from "@/lib/horaires-content";

const badgeLabels: Record<BadgeVariant, string> = {
  jeunes: "Jeunes",
  elite: "Elite",
  loisir: "Loisir",
  libre: "Libre",
};

function getMetaLabel(meta: HorairesResponse["meta"] | null) {
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

function getMetaHelp(meta: HorairesResponse["meta"] | null) {
  if (!meta) {
    return "Récupération des horaires actuels.";
  }

  if (meta.source === "admin") {
    return "Les modifications enregistrées ici sont déjà prioritaires sur la page publique.";
  }

  if (meta.source === "drive") {
    return "Au premier enregistrement ici, le site utilisera cette version admin à la place de Drive.";
  }

  return "Aucune source distante valide n'a été trouvée. Vous pouvez reconstruire les horaires ici.";
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Jamais mis à jour";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminHorairesPage() {
  const [form, setForm] = useState<HorairesData>(defaultHorairesContent);
  const [meta, setMeta] = useState<HorairesResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/horaires");
        const json = (await res.json()) as HorairesResponse;
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
      const res = await fetch("/api/horaires", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const json = (await res.json()) as HorairesResponse;
      setForm(json.data);
      setMeta(json.meta);
      alert("Horaires mis à jour.");
    } catch {
      alert("Erreur lors de l'enregistrement des horaires.");
    } finally {
      setSaving(false);
    }
  }

  function addJour() {
    setForm((current) => ({
      ...current,
      jours: [...current.jours, { jour: "", seances: [] }],
    }));
  }

  function removeJour(index: number) {
    setForm((current) => ({
      ...current,
      jours: current.jours.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateJourName(index: number, value: string) {
    setForm((current) => ({
      ...current,
      jours: current.jours.map((jour, currentIndex) =>
        currentIndex === index ? { ...jour, jour: value } : jour,
      ),
    }));
  }

  function moveJour(index: number, direction: -1 | 1) {
    setForm((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.jours.length) {
        return current;
      }

      const nextJours = [...current.jours];
      const [jour] = nextJours.splice(index, 1);
      nextJours.splice(targetIndex, 0, jour);

      return { ...current, jours: nextJours };
    });
  }

  function addSeance(jourIndex: number) {
    setForm((current) => ({
      ...current,
      jours: current.jours.map((jour, currentIndex) =>
        currentIndex === jourIndex
          ? {
              ...jour,
              seances: [
                ...jour.seances,
                { type: ["loisir"], label: "", horaire: "" },
              ],
            }
          : jour,
      ),
    }));
  }

  function removeSeance(jourIndex: number, seanceIndex: number) {
    setForm((current) => ({
      ...current,
      jours: current.jours.map((jour, currentIndex) =>
        currentIndex === jourIndex
          ? {
              ...jour,
              seances: jour.seances.filter(
                (_, currentSeanceIndex) => currentSeanceIndex !== seanceIndex,
              ),
            }
          : jour,
      ),
    }));
  }

  function moveSeance(
    jourIndex: number,
    seanceIndex: number,
    direction: -1 | 1,
  ) {
    setForm((current) => ({
      ...current,
      jours: current.jours.map((jour, currentIndex) => {
        if (currentIndex !== jourIndex) {
          return jour;
        }

        const targetIndex = seanceIndex + direction;

        if (targetIndex < 0 || targetIndex >= jour.seances.length) {
          return jour;
        }

        const nextSeances = [...jour.seances];
        const [seance] = nextSeances.splice(seanceIndex, 1);
        nextSeances.splice(targetIndex, 0, seance);

        return {
          ...jour,
          seances: nextSeances,
        };
      }),
    }));
  }

  function updateSeanceField(
    jourIndex: number,
    seanceIndex: number,
    key: "label" | "horaire",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      jours: current.jours.map((jour, currentIndex) =>
        currentIndex === jourIndex
          ? {
              ...jour,
              seances: jour.seances.map((seance, currentSeanceIndex) =>
                currentSeanceIndex === seanceIndex
                  ? { ...seance, [key]: value }
                  : seance,
              ),
            }
          : jour,
      ),
    }));
  }

  function toggleBadgeType(
    jourIndex: number,
    seanceIndex: number,
    badgeType: BadgeVariant,
  ) {
    setForm((current) => ({
      ...current,
      jours: current.jours.map((jour, currentIndex) =>
        currentIndex === jourIndex
          ? {
              ...jour,
              seances: jour.seances.map((seance, currentSeanceIndex) => {
                if (currentSeanceIndex !== seanceIndex) {
                  return seance;
                }

                const hasType = seance.type.includes(badgeType);
                return {
                  ...seance,
                  type: hasType
                    ? seance.type.filter((type) => type !== badgeType)
                    : [...seance.type, badgeType],
                };
              }),
            }
          : jour,
      ),
    }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Horaires</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Modifiez ici les jours, créneaux et badges affichés sur la page
              publique `/club/horaires`, sans passer par Drive.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/club/horaires">Voir la page publique</Link>
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
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Planning hebdomadaire</CardTitle>
              <CardDescription>
                Ajoutez les jours, puis les créneaux avec horaire, texte et
                badges de public.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addJour}>
              <Plus className="h-4 w-4" />
              Ajouter un jour
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {form.jours.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Aucun jour configuré pour le moment.
              </div>
            ) : null}

            {form.jours.map((jour, jourIndex) => (
              <div key={`jour-${jourIndex}`} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="grid w-full gap-2 md:max-w-md">
                    <label className="text-sm font-medium">Jour</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="Exemple : Mardi"
                      value={jour.jour}
                      onChange={(event) =>
                        updateJourName(jourIndex, event.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveJour(jourIndex, -1)}
                      disabled={jourIndex === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveJour(jourIndex, 1)}
                      disabled={jourIndex === form.jours.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Descendre
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeJour(jourIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Créneaux de {jour.jour || "ce jour"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSeance(jourIndex)}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un créneau
                    </Button>
                  </div>

                  {jour.seances.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                      Aucun créneau configuré pour ce jour.
                    </div>
                  ) : null}

                  {jour.seances.map((seance, seanceIndex) => (
                    <div
                      key={`seance-${jourIndex}-${seanceIndex}`}
                      className="rounded-2xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="flex flex-wrap gap-2">
                        {badgeVariants.map((badgeType) => {
                          const selected = seance.type.includes(badgeType);

                          return (
                            <button
                              key={badgeType}
                              type="button"
                              onClick={() =>
                                toggleBadgeType(jourIndex, seanceIndex, badgeType)
                              }
                              className="rounded-full"
                            >
                              <Badge
                                variant={selected ? badgeType : "outline"}
                                className={selected ? "" : "opacity-70"}
                              >
                                {badgeLabels[badgeType]}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Horaire</label>
                          <input
                            className="w-full rounded border px-3 py-2"
                            placeholder="Exemple : 18h30 - 20h00"
                            value={seance.horaire}
                            onChange={(event) =>
                              updateSeanceField(
                                jourIndex,
                                seanceIndex,
                                "horaire",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <input
                            className="w-full rounded border px-3 py-2"
                            placeholder="Exemple : Jeunes débutants et confirmés"
                            value={seance.label}
                            onChange={(event) =>
                              updateSeanceField(
                                jourIndex,
                                seanceIndex,
                                "label",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => moveSeance(jourIndex, seanceIndex, -1)}
                          disabled={seanceIndex === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                          Monter
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => moveSeance(jourIndex, seanceIndex, 1)}
                          disabled={seanceIndex === jour.seances.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          Descendre
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeSeance(jourIndex, seanceIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Les jours et créneaux vides seront automatiquement ignorés à
            l&apos;enregistrement.
          </p>

          <Button type="submit" disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer les horaires"}
          </Button>
        </div>
      </form>
    </div>
  );
}
