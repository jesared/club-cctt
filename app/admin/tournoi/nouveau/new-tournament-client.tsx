"use client";

/* eslint-disable react/no-unescaped-entities */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CopyPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatParisDateTimeInput } from "@/lib/dates";

type TournamentSource = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  venue: string | null;
  registrationOpenAt: string | null;
  registrationCloseAt: string | null;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PUBLISHED" | "SUSPENDED" | "CLOSED" | "ARCHIVED";
  eventsCount: number;
};

type NewTournamentForm = {
  sourceTournamentId: string;
  name: string;
  slug: string;
  description: string;
  venue: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  startDate: string;
  endDate: string;
};

type DuplicateTournamentResponse = {
  error?: string;
  tournament?: {
    id: string;
    name?: string | null;
  } | null;
};

type NewTournamentClientProps = {
  sources: TournamentSource[];
};

function toInputValue(value: string | null | undefined) {
  return formatParisDateTimeInput(value);
}

function addOneYear(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + 1);
  return toInputValue(date.toISOString());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getNextEditionYear(sourceStartDate: string) {
  const date = new Date(sourceStartDate);
  if (Number.isNaN(date.getTime())) return new Date().getFullYear() + 1;
  return date.getFullYear() + 1;
}

function buildNextName(name: string, sourceStartDate: string) {
  let replaced = false;
  const nextName = name.replace(/\b(20\d{2})\b/, (year) => {
    const nextYear = Number.parseInt(year, 10) + 1;
    replaced = true;
    return Number.isNaN(nextYear) ? year : nextYear.toString();
  });

  if (replaced) return nextName;

  return `${name} ${getNextEditionYear(sourceStartDate)}`;
}

function buildFormFromSource(source: TournamentSource | undefined): NewTournamentForm {
  if (!source) {
    return {
      sourceTournamentId: "",
      name: "",
      slug: "",
      description: "",
      venue: "",
      registrationOpenAt: "",
      registrationCloseAt: "",
      startDate: "",
      endDate: "",
    };
  }

  const name = buildNextName(source.name, source.startDate);

  return {
    sourceTournamentId: source.id,
    name,
    slug: slugify(buildNextName(source.slug || name, source.startDate)),
    description: source.description ?? "",
    venue: source.venue ?? "",
    registrationOpenAt: addOneYear(source.registrationOpenAt),
    registrationCloseAt: addOneYear(source.registrationCloseAt),
    startDate: addOneYear(source.startDate),
    endDate: addOneYear(source.endDate),
  };
}

async function readJson<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function NewTournamentClient({ sources }: NewTournamentClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<NewTournamentForm>(() =>
    buildFormFromSource(sources[0]),
  );
  const [saving, setSaving] = useState(false);

  const selectedSource = useMemo(
    () => sources.find((source) => source.id === form.sourceTournamentId),
    [form.sourceTournamentId, sources],
  );

  async function duplicateTournament() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tournoi/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await readJson<DuplicateTournamentResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Creation impossible.");
        return;
      }

      if (!json?.tournament?.id) {
        alert("Tournoi cree, mais redirection impossible.");
        return;
      }

      router.push(`/admin/tournoi/edition/${json.tournament.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (sources.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Aucun tournoi n'est disponible comme base de duplication.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="admin-form-card">
        <CardHeader className="admin-form-header">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CopyPlus className="h-5 w-5 text-primary" />
            Dupliquer une édition
          </CardTitle>
          <CardDescription>
            Les tableaux, catégories, horaires relatifs et tarifs sont copiés. Les inscriptions et paiements ne le sont pas.
          </CardDescription>
        </CardHeader>
        <CardContent className="admin-form-content">
          <div className="admin-form-note">
            Choisissez l'édition de référence, puis ajustez les informations de la nouvelle édition avant création.
          </div>

          <div className="admin-field-wide">
            <label className="admin-label">Édition source</label>
            <select
              className="admin-select"
              value={form.sourceTournamentId}
              onChange={(event) => {
                const source = sources.find((item) => item.id === event.target.value);
                setForm(buildFormFromSource(source));
              }}
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name} - {source.eventsCount} tableau(x)
                </option>
              ))}
            </select>
          </div>

          {selectedSource ? (
            <div className="admin-form-note">
              Source : {selectedSource.slug} · {selectedSource.eventsCount} tableau(x). Les nouveaux tableaux seront remis en statut OPEN.
            </div>
          ) : null}

          <div className="admin-field-wide">
            <label className="admin-label">Nom</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Tournoi national du CCTT 2027"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Slug</label>
            <input
              className="admin-input font-mono text-[13px]"
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  slug: slugify(event.target.value),
                }))
              }
              placeholder="tournoi-national-2027"
              spellCheck={false}
            />
          </div>

          <div className="admin-field-wide">
            <label className="admin-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="admin-field-wide">
            <label className="admin-label">Lieu</label>
            <input
              className="admin-input"
              value={form.venue}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  venue: event.target.value,
                }))
              }
            />
          </div>

          <div className="admin-field-pair">
            <div className="admin-field">
              <label className="admin-label">Ouverture inscriptions</label>
              <div className="has-calendar-icon">
                <input
                  type="datetime-local"
                  className="admin-input pr-10"
                  value={form.registrationOpenAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      registrationOpenAt: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Fermeture inscriptions</label>
              <div className="has-calendar-icon">
                <input
                  type="datetime-local"
                  className="admin-input pr-10"
                  value={form.registrationCloseAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      registrationCloseAt: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-field-pair">
            <div className="admin-field">
              <label className="admin-label">Début tournoi</label>
              <div className="has-calendar-icon">
                <input
                  type="datetime-local"
                  className="admin-input pr-10"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Fin tournoi</label>
              <div className="has-calendar-icon">
                <input
                  type="datetime-local"
                  className="admin-input pr-10"
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <Button
              type="button"
              onClick={duplicateTournament}
              disabled={saving || !form.sourceTournamentId}
            >
              {saving ? "Création..." : "Créer le tournoi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
