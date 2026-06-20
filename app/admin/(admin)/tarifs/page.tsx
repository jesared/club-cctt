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
  defaultTarifsContent,
  type TarifBloc,
  type TarifLigne,
  type TarifsData,
  type TarifsResponse,
} from "@/lib/tarifs-content";

const emptyBloc: TarifBloc = {
  categorie: "",
  details: "",
  lignes: [],
};

const emptyLigne: TarifLigne = {
  nom: "",
  prix: "",
  highlight: false,
};

function getMetaLabel(meta: TarifsResponse["meta"] | null) {
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

function getMetaHelp(meta: TarifsResponse["meta"] | null) {
  if (!meta) {
    return "Récupération des tarifs actuels.";
  }

  if (meta.source === "admin") {
    return "Les modifications enregistrées ici sont déjà prioritaires sur la page publique.";
  }

  if (meta.source === "drive") {
    return "Au premier enregistrement ici, le site utilisera cette version admin à la place de Drive.";
  }

  return "Aucune source distante valide n'a été trouvée. Vous pouvez reconstruire les tarifs ici.";
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

export default function AdminTarifsPage() {
  const [form, setForm] = useState<TarifsData>(defaultTarifsContent);
  const [meta, setMeta] = useState<TarifsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/tarifs");
        const json = (await res.json()) as TarifsResponse;
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
      const res = await fetch("/api/tarifs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const json = (await res.json()) as TarifsResponse;
      setForm(json.data);
      setMeta(json.meta);
      alert("Tarifs mis à jour.");
    } catch {
      alert("Erreur lors de l'enregistrement des tarifs.");
    } finally {
      setSaving(false);
    }
  }

  function addBloc() {
    setForm((current) => ({
      ...current,
      blocs: [...current.blocs, { ...emptyBloc }],
    }));
  }

  function removeBloc(index: number) {
    setForm((current) => ({
      ...current,
      blocs: current.blocs.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function moveBloc(index: number, direction: -1 | 1) {
    setForm((current) => ({
      ...current,
      blocs: moveItem(current.blocs, index, direction),
    }));
  }

  function updateBlocField(
    index: number,
    key: "catégorie" | "details",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      blocs: current.blocs.map((bloc, currentIndex) =>
        currentIndex === index ? { ...bloc, [key]: value } : bloc,
      ),
    }));
  }

  function addLigne(blocIndex: number) {
    setForm((current) => ({
      ...current,
      blocs: current.blocs.map((bloc, currentIndex) =>
        currentIndex === blocIndex
          ? { ...bloc, lignes: [...bloc.lignes, { ...emptyLigne }] }
          : bloc,
      ),
    }));
  }

  function removeLigne(blocIndex: number, ligneIndex: number) {
    setForm((current) => ({
      ...current,
      blocs: current.blocs.map((bloc, currentIndex) =>
        currentIndex === blocIndex
          ? {
              ...bloc,
              lignes: bloc.lignes.filter(
                (_, currentLigneIndex) => currentLigneIndex !== ligneIndex,
              ),
            }
          : bloc,
      ),
    }));
  }

  function moveLigne(blocIndex: number, ligneIndex: number, direction: -1 | 1) {
    setForm((current) => ({
      ...current,
      blocs: current.blocs.map((bloc, currentIndex) =>
        currentIndex === blocIndex
          ? { ...bloc, lignes: moveItem(bloc.lignes, ligneIndex, direction) }
          : bloc,
      ),
    }));
  }

  function updateLigneField(
    blocIndex: number,
    ligneIndex: number,
    key: "nom" | "prix" | "highlight",
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      blocs: current.blocs.map((bloc, currentIndex) =>
        currentIndex === blocIndex
          ? {
              ...bloc,
              lignes: bloc.lignes.map((ligne, currentLigneIndex) =>
                currentLigneIndex === ligneIndex
                  ? { ...ligne, [key]: value }
                  : ligne,
              ),
            }
          : bloc,
      ),
    }));
  }

  function addStringItem(key: "lignes" | "mentions") {
    setForm((current) => ({
      ...current,
      paiement: {
        ...current.paiement,
        [key]: [...current.paiement[key], ""],
      },
    }));
  }

  function updateStringItem(
    section: "paiementLignes" | "paiementMentions" | "inclus",
    index: number,
    value: string,
  ) {
    setForm((current) => {
      if (section === "inclus") {
        return {
          ...current,
          inclus: current.inclus.map((item, currentIndex) =>
            currentIndex === index ? value : item,
          ),
        };
      }

      const key = section === "paiementLignes" ? "lignes" : "mentions";
      return {
        ...current,
        paiement: {
          ...current.paiement,
          [key]: current.paiement[key].map((item, currentIndex) =>
            currentIndex === index ? value : item,
          ),
        },
      };
    });
  }

  function removeStringItem(
    section: "paiementLignes" | "paiementMentions" | "inclus",
    index: number,
  ) {
    setForm((current) => {
      if (section === "inclus") {
        return {
          ...current,
          inclus: current.inclus.filter((_, currentIndex) => currentIndex !== index),
        };
      }

      const key = section === "paiementLignes" ? "lignes" : "mentions";
      return {
        ...current,
        paiement: {
          ...current.paiement,
          [key]: current.paiement[key].filter(
            (_, currentIndex) => currentIndex !== index,
          ),
        },
      };
    });
  }

  function moveStringItem(
    section: "paiementLignes" | "paiementMentions" | "inclus",
    index: number,
    direction: -1 | 1,
  ) {
    setForm((current) => {
      if (section === "inclus") {
        return {
          ...current,
          inclus: moveItem(current.inclus, index, direction),
        };
      }

      const key = section === "paiementLignes" ? "lignes" : "mentions";
      return {
        ...current,
        paiement: {
          ...current.paiement,
          [key]: moveItem(current.paiement[key], index, direction),
        },
      };
    });
  }

  function addInclus() {
    setForm((current) => ({
      ...current,
      inclus: [...current.inclus, ""],
    }));
  }

  function updatePaiementField(key: "titre", value: string) {
    setForm((current) => ({
      ...current,
      paiement: {
        ...current.paiement,
        [key]: value,
      },
    }));
  }

  function updateInscriptionField(
    key: keyof TarifsData["inscription"],
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      inscription: {
        ...current.inscription,
        [key]: value,
      },
    }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Tarifs</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Modifiez ici les cotisations, moyens de paiement et informations
              d&apos;inscription affichées sur la page publique `/club/tarifs`.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/club/tarifs">Voir la page publique</Link>
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
              <CardTitle>Cotisations</CardTitle>
              <CardDescription>
                Une carte par catégorie avec plusieurs lignes de prix.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addBloc}>
              <Plus className="h-4 w-4" />
              Ajouter une catégorie
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {form.blocs.map((bloc, blocIndex) => (
              <div key={`bloc-${blocIndex}`} className="rounded-2xl border p-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Catégorie</label>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={bloc.categorie}
                        onChange={(event) =>
                          updateBlocField(blocIndex, "catégorie", event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Détails</label>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={bloc.details ?? ""}
                        onChange={(event) =>
                          updateBlocField(blocIndex, "details", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveBloc(blocIndex, -1)}
                      disabled={blocIndex === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveBloc(blocIndex, 1)}
                      disabled={blocIndex === form.blocs.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      Descendre
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeBloc(blocIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Lignes de prix de {bloc.categorie || "cette catégorie"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addLigne(blocIndex)}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une ligne
                    </Button>
                  </div>

                  {bloc.lignes.map((ligne, ligneIndex) => (
                    <div
                      key={`ligne-${blocIndex}-${ligneIndex}`}
                      className="rounded-2xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Nom</label>
                          <input
                            className="w-full rounded border px-3 py-2"
                            value={ligne.nom}
                            onChange={(event) =>
                              updateLigneField(
                                blocIndex,
                                ligneIndex,
                                "nom",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Prix</label>
                          <input
                            className="w-full rounded border px-3 py-2"
                            value={ligne.prix}
                            onChange={(event) =>
                              updateLigneField(
                                blocIndex,
                                ligneIndex,
                                "prix",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <label className="mt-4 flex items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={ligne.highlight === true}
                          onChange={(event) =>
                            updateLigneField(
                              blocIndex,
                              ligneIndex,
                              "highlight",
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4"
                        />
                        Mettre cette ligne en avant
                      </label>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => moveLigne(blocIndex, ligneIndex, -1)}
                          disabled={ligneIndex === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                          Monter
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => moveLigne(blocIndex, ligneIndex, 1)}
                          disabled={ligneIndex === bloc.lignes.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          Descendre
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeLigne(blocIndex, ligneIndex)}
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

        <Card>
          <CardHeader>
            <CardTitle>Paiement</CardTitle>
            <CardDescription>
              Titre, moyens acceptés et mentions complémentaires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.paiement.titre}
                onChange={(event) =>
                  updatePaiementField("titre", event.target.value)
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">Moyens de paiement</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addStringItem("lignes")}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un moyen de paiement
                </Button>
              </div>

              {form.paiement.lignes.map((item, index) => (
                <div
                  key={`paiement-ligne-${index}`}
                  className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center"
                >
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={item}
                    onChange={(event) =>
                      updateStringItem("paiementLignes", index, event.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveStringItem("paiementLignes", index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveStringItem("paiementLignes", index, 1)}
                      disabled={index === form.paiement.lignes.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeStringItem("paiementLignes", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">Mentions</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addStringItem("mentions")}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une mention
                </Button>
              </div>

              {form.paiement.mentions.map((item, index) => (
                <div
                  key={`paiement-mention-${index}`}
                  className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center"
                >
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={item}
                    onChange={(event) =>
                      updateStringItem(
                        "paiementMentions",
                        index,
                        event.target.value,
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveStringItem("paiementMentions", index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveStringItem("paiementMentions", index, 1)}
                      disabled={index === form.paiement.mentions.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeStringItem("paiementMentions", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Inclus dans la cotisation</CardTitle>
              <CardDescription>
                Liste des éléments compris dans la formule annuelle.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addInclus}>
              <Plus className="h-4 w-4" />
              Ajouter un élément inclus
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.inclus.map((item, index) => (
              <div
                key={`inclus-${index}`}
                className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center"
              >
                <input
                  className="w-full rounded border px-3 py-2"
                  value={item}
                  onChange={(event) =>
                    updateStringItem("inclus", index, event.target.value)
                  }
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => moveStringItem("inclus", index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => moveStringItem("inclus", index, 1)}
                    disabled={index === form.inclus.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeStringItem("inclus", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bloc d&apos;inscription</CardTitle>
            <CardDescription>
              Texte et lien du call-to-action en bas de la page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titre</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={form.inscription.titre}
                onChange={(event) =>
                  updateInscriptionField("titre", event.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded border px-3 py-2"
                rows={4}
                value={form.inscription.description}
                onChange={(event) =>
                  updateInscriptionField("description", event.target.value)
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Bouton - label</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={form.inscription.ctaLabel}
                  onChange={(event) =>
                    updateInscriptionField("ctaLabel", event.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Bouton - lien</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={form.inscription.ctaHref}
                  onChange={(event) =>
                    updateInscriptionField("ctaHref", event.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Les lignes vides seront automatiquement ignorées à
            l&apos;enregistrement.
          </p>

          <Button type="submit" disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer les tarifs"}
          </Button>
        </div>
      </form>
    </div>
  );
}
