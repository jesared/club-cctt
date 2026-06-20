"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  GraduationCap,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

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

type DiplomaFormItem = {
  title: string;
  year: string;
};

type SalaryFormMember = SimpleMember & {
  diplomas: DiplomaFormItem[];
};

type SalariesFormState = Omit<ComiteData, "salaries"> & {
  salaries: SalaryFormMember[];
};

const emptySalary: SimpleMember = {
  nom: "",
  description: "",
  photo: "",
};

const emptyDiploma: DiplomaFormItem = {
  title: "",
  year: "",
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

function cleanDiplomaText(value: string) {
  return value
    .replace(/dipl[oô]mes?\s*(et|&)\s*certifications?/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSalaryDiplomas(description: string): DiplomaFormItem[] {
  const items: DiplomaFormItem[] = [];

  for (const rawLine of description.split(/\r?\n/)) {
    const line = cleanDiplomaText(rawLine);

    if (!line) {
      continue;
    }

    const titleThenYear = line.match(
      /^(.*?)(?:\s*:\s*|\s+)((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)$/i,
    );

    if (titleThenYear?.[1]) {
      items.push({
        title: titleThenYear[1].trim(),
        year: titleThenYear[2]?.replace(/\s+/g, "") ?? "",
      });
      continue;
    }

    const yearThenTitle = line.match(
      /^((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)\s+(.*)$/i,
    );

    if (yearThenTitle?.[2]) {
      items.push({
        title: yearThenTitle[2].trim(),
        year: yearThenTitle[1]?.replace(/\s+/g, "") ?? "",
      });
      continue;
    }

    items.push({ title: line, year: "" });
  }

  return items.length > 0 ? items : [{ ...emptyDiploma }];
}

function diplomasToDescription(diplomas: DiplomaFormItem[]) {
  return diplomas
    .map((diploma) => ({
      title: diploma.title.trim(),
      year: diploma.year.trim(),
    }))
    .filter((diploma) => diploma.title || diploma.year)
    .map((diploma) =>
      diploma.title && diploma.year
        ? `${diploma.title} : ${diploma.year}`
        : diploma.title || diploma.year,
    )
    .join("\n");
}

function toSalariesFormState(data: ComiteData): SalariesFormState {
  return {
    bureau: data.bureau,
    membres: data.membres,
    benevoles: data.benevoles,
    salaries: data.salaries.map((member) => ({
      ...member,
      diplomas: parseSalaryDiplomas(member.description ?? ""),
    })),
  };
}

function cleanComiteForm(form: SalariesFormState): ComiteData {
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
      description: diplomasToDescription(member.diplomas),
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

export default function AdminSalariesPage() {
  const [form, setForm] = useState<SalariesFormState>(() =>
    toSalariesFormState(defaultComiteContent),
  );
  const [meta, setMeta] = useState<ComiteResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/comite");
        const json = (await res.json()) as ComiteResponse;
        setForm(toSalariesFormState(json.data));
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
      setForm(toSalariesFormState(json.data));
      setMeta(json.meta);
      alert("Salaries mis a jour.");
    } catch {
      alert("Erreur lors de l'enregistrement des salaries.");
    } finally {
      setSaving(false);
    }
  }

  function updateSalary<K extends keyof SimpleMember>(
    index: number,
    field: K,
    value: SimpleMember[K],
  ) {
    setForm((current) => ({
      ...current,
      salaries: current.salaries.map((member, currentIndex) =>
        currentIndex === index ? { ...member, [field]: value } : member,
      ),
    }));
  }

  function addSalary() {
    setForm((current) => ({
      ...current,
      salaries: [
        ...current.salaries,
        { ...emptySalary, diplomas: [{ ...emptyDiploma }] },
      ],
    }));
  }

  function removeSalary(index: number) {
    setForm((current) => ({
      ...current,
      salaries: current.salaries.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  }

  function moveSalary(index: number, direction: -1 | 1) {
    setForm((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.salaries.length) {
        return current;
      }

      const nextSalaries = [...current.salaries];
      const [member] = nextSalaries.splice(index, 1);
      nextSalaries.splice(targetIndex, 0, member);

      return { ...current, salaries: nextSalaries };
    });
  }

  function updateSalaryDiploma(
    salaryIndex: number,
    diplomaIndex: number,
    field: keyof DiplomaFormItem,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      salaries: current.salaries.map((member, currentSalaryIndex) =>
        currentSalaryIndex === salaryIndex
          ? {
              ...member,
              diplomas: member.diplomas.map((diploma, currentDiplomaIndex) =>
                currentDiplomaIndex === diplomaIndex
                  ? { ...diploma, [field]: value }
                  : diploma,
              ),
            }
          : member,
      ),
    }));
  }

  function addSalaryDiploma(salaryIndex: number) {
    setForm((current) => ({
      ...current,
      salaries: current.salaries.map((member, currentSalaryIndex) =>
        currentSalaryIndex === salaryIndex
          ? {
              ...member,
              diplomas: [...member.diplomas, { ...emptyDiploma }],
            }
          : member,
      ),
    }));
  }

  function removeSalaryDiploma(salaryIndex: number, diplomaIndex: number) {
    setForm((current) => ({
      ...current,
      salaries: current.salaries.map((member, currentSalaryIndex) => {
        if (currentSalaryIndex !== salaryIndex) {
          return member;
        }

        const nextDiplomas = member.diplomas.filter(
          (_, currentDiplomaIndex) => currentDiplomaIndex !== diplomaIndex,
        );

        return {
          ...member,
          diplomas:
            nextDiplomas.length > 0 ? nextDiplomas : [{ ...emptyDiploma }],
        };
      }),
    }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Salaries diplomes</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Modifiez ici les salaries affiches sur la page publique
              /club/salaries. Ils sont separes du comite directeur.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/comite-directeur">Modifier le comite</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/club/salaries">Voir la page publique</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-base">Source salaries</CardTitle>
            <CardDescription>
              Les modifications enregistrees ici utilisent la meme source de
              donnees que le comite, mais la page publique est distincte.
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
              <CardTitle>Équipe salariee</CardTitle>
              <CardDescription>
                Ajoutez un nom, des diplomes et une photo pour chaque salarie
                affiche sur la page publique.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addSalary}>
              <Plus className="h-4 w-4" />
              Ajouter un salarié
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.salaries.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Aucun salarie pour le moment.
              </div>
            ) : null}

            {form.salaries.map((member, index) => (
              <div
                key={`salarie-${index}`}
                className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_180px]"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nom</label>
                    <input
                      className="w-full rounded border px-3 py-2"
                      placeholder="Nom du salarie"
                      value={member.nom}
                      onChange={(event) =>
                        updateSalary(index, "nom", event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="text-sm font-medium">
                          Diplomes et certifications
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Chaque diplome est gere separement pour un affichage
                          plus propre.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSalaryDiploma(index)}
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un diplôme
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {member.diplomas.map((diploma, diplomaIndex) => (
                        <div
                          key={`salary-${index}-diploma-${diplomaIndex}`}
                          className="rounded-xl border border-border/70 bg-muted/10 p-3"
                        >
                          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-end">
                            <div className="grid gap-2">
                              <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Intitule
                              </label>
                              <div className="relative">
                                <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                  className="w-full rounded border px-3 py-2 pl-9"
                                  placeholder="DEJEPS tennis de table"
                                  value={diploma.title}
                                  onChange={(event) =>
                                    updateSalaryDiploma(
                                      index,
                                      diplomaIndex,
                                      "title",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Annee
                              </label>
                              <input
                                className="w-full rounded border px-3 py-2"
                                placeholder="2024-2025"
                                value={diploma.year}
                                onChange={(event) =>
                                  updateSalaryDiploma(
                                    index,
                                    diplomaIndex,
                                    "year",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                removeSalaryDiploma(index, diplomaIndex)
                              }
                              aria-label="Supprimer ce diplome"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        updateSalary(index, "photo", event.target.value)
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
                      onClick={() => moveSalary(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveSalary(index, 1)}
                      disabled={index === form.salaries.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Descendre
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeSalary(index)}
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
            {saving ? "Enregistrement..." : "Enregistrer les salaries"}
          </Button>
        </div>
      </form>
    </div>
  );
}
