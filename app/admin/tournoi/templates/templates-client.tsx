"use client";

import { useEffect, useState } from "react";

import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TournamentTemplateForm = {
  slug: string;
  name: string;
  description: string;
  venue: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PUBLISHED";
};

type EventTemplateForm = {
  id: string;
  code: string;
  label: string;
  gender: "MIXED" | "M" | "F";
  minPoints: string;
  maxPoints: string;
  maxPlayers: string;
  startAt: string;
  feeOnlineCents: string;
  feeOnsiteCents: string;
  status: "OPEN" | "FULL" | "CLOSED" | "CANCELLED";
};

type TournamentTemplateEventPayload = {
  id: string;
  code?: string | null;
  label?: string | null;
  gender?: EventTemplateForm["gender"] | null;
  minPoints?: number | null;
  maxPoints?: number | null;
  maxPlayers?: number | null;
  startAt?: string | null;
  feeOnlineCents?: number | null;
  feeOnsiteCents?: number | null;
  status?: EventTemplateForm["status"] | null;
};

type TournamentTemplatePayload = {
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  venue?: string | null;
  registrationOpenAt?: string | null;
  registrationCloseAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: TournamentTemplateForm["status"] | null;
};

type TournamentTemplatesResponse = {
  error?: string;
  tournamentTemplate?: TournamentTemplatePayload | null;
  eventTemplates?: TournamentTemplateEventPayload[] | null;
  tournament?: { name?: string | null } | null;
  template?: TournamentTemplateEventPayload | null;
};

const emptyTournamentTemplate: TournamentTemplateForm = {
  slug: "",
  name: "",
  description: "",
  venue: "",
  registrationOpenAt: "",
  registrationCloseAt: "",
  startDate: "",
  endDate: "",
  status: "DRAFT",
};

const emptyEventTemplate: EventTemplateForm = {
  id: "new",
  code: "",
  label: "",
  gender: "MIXED",
  minPoints: "",
  maxPoints: "",
  maxPlayers: "32",
  startAt: "",
  feeOnlineCents: "",
  feeOnsiteCents: "",
  status: "OPEN",
};

function toInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

function getDatePart(value: string) {
  return value.slice(0, 10);
}

function getTimePart(value: string) {
  return value.slice(11, 16);
}

function updateDateTimeValue(
  currentValue: string,
  part: "date" | "time",
  nextValue: string,
) {
  const datePart = part === "date" ? nextValue : getDatePart(currentValue);
  const timePart = part === "time" ? nextValue : getTimePart(currentValue);

  if (!datePart && !timePart) {
    return "";
  }

  if (!datePart) {
    return "";
  }

  return `${datePart}T${timePart}`;
}

function hasCompleteDateTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
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

function toEventTemplateForm(
  event: TournamentTemplateEventPayload,
): EventTemplateForm {
  return {
    id: event.id,
    code: event.code ?? "",
    label: event.label ?? "",
    gender: event.gender ?? "MIXED",
    minPoints: event.minPoints?.toString() ?? "",
    maxPoints: event.maxPoints?.toString() ?? "",
    maxPlayers: event.maxPlayers?.toString() ?? "32",
    startAt: toInputValue(event.startAt),
    feeOnlineCents: event.feeOnlineCents?.toString() ?? "",
    feeOnsiteCents: event.feeOnsiteCents?.toString() ?? "",
    status: event.status ?? "OPEN",
  };
}

export function TemplatesClient() {
  const [tournament, setTournament] = useState<TournamentTemplateForm>(
    emptyTournamentTemplate,
  );
  const [eventTemplates, setEventTemplates] = useState<EventTemplateForm[]>([]);
  const [newEvent, setNewEvent] = useState<EventTemplateForm>(
    emptyEventTemplate,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingTournament, setSavingTournament] = useState(false);
  const [savingEvent, setSavingEvent] = useState<string | null>(null);
  const [creatingTournament, setCreatingTournament] = useState(false);
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-action-menu]")) {
        setOpenActionId(null);
      }
    }

    if (openActionId) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openActionId]);

  async function loadTemplates() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/tournoi/templates");
      const json = await readJson<TournamentTemplatesResponse>(res);
      if (!res.ok) {
        const statusInfo = `${res.status} ${res.statusText || "Erreur"}`.trim();
        setLoadError(
          [json?.error, statusInfo].filter(Boolean).join(" — ") ||
            "Chargement impossible.",
        );
        return;
      }
      if (json?.tournamentTemplate) {
        setTournament({
          slug: json.tournamentTemplate.slug ?? "",
          name: json.tournamentTemplate.name ?? "",
          description: json.tournamentTemplate.description ?? "",
          venue: json.tournamentTemplate.venue ?? "",
          registrationOpenAt: toInputValue(
            json.tournamentTemplate.registrationOpenAt,
          ),
          registrationCloseAt: toInputValue(
            json.tournamentTemplate.registrationCloseAt,
          ),
          startDate: toInputValue(json.tournamentTemplate.startDate),
          endDate: toInputValue(json.tournamentTemplate.endDate),
          status:
            json.tournamentTemplate.status === "PUBLISHED"
              ? "PUBLISHED"
              : "DRAFT",
        });
      }

      const events = (json?.eventTemplates ?? []).map(toEventTemplateForm);

      setEventTemplates(events);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function saveTournament() {
    setSavingTournament(true);
    try {
      const res = await fetch("/api/admin/tournoi/templates/tournament", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tournament),
      });

      if (!res.ok) throw new Error();
      alert("Template tournoi enregistré.");
    } catch {
      alert("Erreur lors de l'enregistrement du template.");
    } finally {
      setSavingTournament(false);
    }
  }

  async function createTournamentFromTemplate() {
    setCreatingTournament(true);
    try {
      const res = await fetch("/api/admin/tournoi/create-from-template", {
        method: "POST",
      });
      const json = await readJson<TournamentTemplatesResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Erreur lors de la création.");
        return;
      }
      if (!json?.tournament) {
        alert("Tournoi créé.");
        return;
      }
      alert(`Tournoi créé: ${json.tournament.name}`);
    } finally {
      setCreatingTournament(false);
    }
  }

  async function seedDefaults() {
    if (!confirm("Pre-remplir les templates avec des exemples ?")) return;
    setSeedingDefaults(true);
    try {
      const res = await fetch("/api/admin/tournoi/templates/seed-defaults", {
        method: "POST",
      });
      const json = await readJson<TournamentTemplatesResponse>(res);
      if (!res.ok) {
        if (res.status === 409) {
          const overwrite = confirm(
            "Des templates existent deja. Ecraser avec le dernier tournoi ?",
          );
          if (overwrite) {
            const forced = await fetch(
              "/api/admin/tournoi/templates/seed-defaults?force=1",
              { method: "POST" },
            );
            const forcedJson = await readJson<TournamentTemplatesResponse>(forced);
            if (!forced.ok) {
              alert(forcedJson?.error ?? "Impossible de pre-remplir.");
              return;
            }
          } else {
            return;
          }
        } else {
          alert(json?.error ?? "Impossible de pre-remplir.");
          return;
        }
      }
      await loadTemplates();
      alert("Templates d'exemple crees.");
    } finally {
      setSeedingDefaults(false);
    }
  }

  async function createEventTemplate() {
    if (!hasCompleteDateTime(newEvent.startAt)) {
      alert("Renseignez la date et l'heure du tableau.");
      return;
    }
    setSavingEvent("new");
    try {
      const res = await fetch("/api/admin/tournoi/templates/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      const json = await readJson<TournamentTemplatesResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Erreur lors de la création.");
        return;
      }
      if (!json?.template) {
        alert("Template créé.");
        return;
      }
      const createdTemplate = json.template;
      setEventTemplates((current) => [
        ...current,
        toEventTemplateForm(createdTemplate),
      ]);
      setNewEvent(emptyEventTemplate);
    } finally {
      setSavingEvent(null);
    }
  }

  async function updateEventTemplate(event: EventTemplateForm) {
    if (!hasCompleteDateTime(event.startAt)) {
      alert("Renseignez la date et l'heure du tableau.");
      return;
    }
    setSavingEvent(event.id);
    try {
      const res = await fetch(
        `/api/admin/tournoi/templates/event/${event.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        },
      );
      if (!res.ok) throw new Error();
      alert("Template tableau mis à jour.");
    } catch {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setSavingEvent(null);
    }
  }

  async function deleteEventTemplate(id: string) {
    if (!confirm("Supprimer ce template ?")) return;
    setSavingEvent(id);
    try {
      const res = await fetch(
        `/api/admin/tournoi/templates/event/${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      setEventTemplates((current) => current.filter((item) => item.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setSavingEvent(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }
  if (loadError) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Impossible de charger les templates.</p>
        <p className="mt-1">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="admin-form-card">
        <CardHeader className="admin-form-header">
          <CardTitle className="text-lg">Template tournoi</CardTitle>
          <CardDescription>
            Base de création pour vos nouveaux tournois, avec dates clés et informations générales.
          </CardDescription>
        </CardHeader>
        <CardContent className="admin-form-content">
          <div className="admin-form-note">
            Renseignez les informations affichées dans l&apos;admin. Les dates sont saisies en heure locale.
          </div>
          <div className="admin-field-wide">
            <label className="admin-label">Nom</label>
            <input
              className="admin-input"
              value={tournament.name}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Tournoi national du CCTT"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Slug</label>
            <input
              className="admin-input font-mono text-[13px]"
              value={tournament.slug}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }
              placeholder="tournoi-national-2026"
              spellCheck={false}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Statut</label>
            <select
              className="admin-select"
              value={tournament.status}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  status: event.target.value as TournamentTemplateForm["status"],
                }))
              }
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <div className="admin-field-wide">
            <label className="admin-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={tournament.description}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Présentation courte du tournoi, ambiance, public visé, informations utiles..."
            />
          </div>
          <div className="admin-field-wide">
            <label className="admin-label">Lieu</label>
            <input
              className="admin-input"
              value={tournament.venue}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  venue: event.target.value,
                }))
              }
              placeholder="Salle omnisports, Reims"
            />
          </div>
          <div className="admin-field-pair">
            <div className="admin-field">
              <label className="admin-label">Ouverture inscriptions</label>
              <div className="has-calendar-icon">
                <input
                  type="datetime-local"
                  className="admin-input pr-10"
                  value={tournament.registrationOpenAt}
                  onChange={(event) =>
                    setTournament((current) => ({
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
                  value={tournament.registrationCloseAt}
                  onChange={(event) =>
                    setTournament((current) => ({
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
                  value={tournament.startDate}
                  onChange={(event) =>
                    setTournament((current) => ({
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
                  value={tournament.endDate}
                  onChange={(event) =>
                    setTournament((current) => ({
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
              onClick={saveTournament}
              disabled={savingTournament}
            >
              {savingTournament ? "Enregistrement..." : "Enregistrer le template"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={createTournamentFromTemplate}
              disabled={creatingTournament}
            >
              {creatingTournament ? "Création..." : "Créer un tournoi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={seedDefaults}
              disabled={seedingDefaults}
            >
              {seedingDefaults ? "Pre-remplissage..." : "Pre-remplir avec exemples"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Templates de tableaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 text-sm">
          <div>
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="py-2 pr-2 font-semibold w-16">Code</th>
                  <th className="py-2 pr-2 font-semibold w-32">Label</th>
                  <th className="hidden md:table-cell py-2 pr-2 font-semibold w-20">Genre</th>
                  <th className="hidden lg:table-cell py-2 pr-2 font-semibold w-16">Min</th>
                  <th className="hidden lg:table-cell py-2 pr-2 font-semibold w-16">Max pts</th>
                  <th className="hidden lg:table-cell py-2 pr-2 font-semibold w-20">Max joueurs</th>
                  <th className="py-2 pr-2 font-semibold w-40">Date / heure</th>
                  <th className="hidden xl:table-cell py-2 pr-2 font-semibold w-20">En ligne</th>
                  <th className="hidden xl:table-cell py-2 pr-2 font-semibold w-20">Sur place</th>
                  <th className="hidden md:table-cell py-2 pr-2 font-semibold w-20">Statut</th>
                  <th className="py-2 font-semibold w-12"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-muted/30">
                  <td className="py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.code}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          code: event.target.value.toUpperCase(),
                        }))
                      }
                      aria-label="Code"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.label}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          label: event.target.value,
                        }))
                      }
                      aria-label="Label"
                    />
                  </td>
                  <td className="hidden md:table-cell py-2 pr-2">
                    <select
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.gender}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          gender: event.target.value as EventTemplateForm["gender"],
                        }))
                      }
                      aria-label="Genre"
                    >
                      <option value="MIXED">MIXED</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                  <td className="hidden lg:table-cell py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.minPoints}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          minPoints: event.target.value,
                        }))
                      }
                      aria-label="Min points"
                    />
                  </td>
                  <td className="hidden lg:table-cell py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.maxPoints}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          maxPoints: event.target.value,
                        }))
                      }
                      aria-label="Max points"
                    />
                  </td>
                  <td className="hidden lg:table-cell py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.maxPlayers}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          maxPlayers: event.target.value,
                        }))
                      }
                      aria-label="Max joueurs"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="grid gap-1">
                      <input
                        type="date"
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={getDatePart(newEvent.startAt)}
                        onChange={(event) =>
                          setNewEvent((current) => ({
                            ...current,
                            startAt: updateDateTimeValue(
                              current.startAt,
                              "date",
                              event.target.value,
                            ),
                          }))
                        }
                        aria-label="Date"
                      />
                      <input
                        type="time"
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={getTimePart(newEvent.startAt)}
                        onChange={(event) =>
                          setNewEvent((current) => ({
                            ...current,
                            startAt: updateDateTimeValue(
                              current.startAt,
                              "time",
                              event.target.value,
                            ),
                          }))
                        }
                        aria-label="Heure"
                      />
                    </div>
                  </td>
                  <td className="hidden xl:table-cell py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.feeOnlineCents}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          feeOnlineCents: event.target.value,
                        }))
                      }
                      aria-label="Frais en ligne"
                    />
                  </td>
                  <td className="hidden xl:table-cell py-2 pr-2">
                    <input
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.feeOnsiteCents}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          feeOnsiteCents: event.target.value,
                        }))
                      }
                      aria-label="Frais sur place"
                    />
                  </td>
                  <td className="hidden md:table-cell py-2 pr-2">
                    <select
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.status}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          status: event.target.value as EventTemplateForm["status"],
                        }))
                      }
                      aria-label="Statut"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="FULL">FULL</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="py-2">
                    <Button
                      type="button"
                      size="icon"
                      className="rounded-full"
                      onClick={createEventTemplate}
                      disabled={savingEvent === "new"}
                      aria-label={savingEvent === "new" ? "Création en cours" : "Ajouter"}
                      title={savingEvent === "new" ? "Création..." : "Ajouter"}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </td>
                </tr>

                {eventTemplates.map((event) => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.code}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, code: e.target.value.toUpperCase() }
                                : item,
                            ),
                          )
                        }
                        aria-label="Code"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.label}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, label: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Label"
                      />
                    </td>
                    <td className="hidden md:table-cell py-2 pr-2">
                      <select
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.gender}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? {
                                    ...item,
                                    gender: e.target.value as EventTemplateForm["gender"],
                                  }
                                : item,
                            ),
                          )
                        }
                        aria-label="Genre"
                      >
                        <option value="MIXED">MIXED</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                      </select>
                    </td>
                    <td className="hidden lg:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.minPoints}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, minPoints: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Min points"
                      />
                    </td>
                    <td className="hidden lg:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.maxPoints}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, maxPoints: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Max points"
                      />
                    </td>
                    <td className="hidden lg:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.maxPlayers}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, maxPlayers: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Max joueurs"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <div className="grid gap-1">
                        <input
                          type="date"
                          className="h-8 w-full rounded border px-2 text-xs"
                          value={getDatePart(event.startAt)}
                          onChange={(e) =>
                            setEventTemplates((current) =>
                              current.map((item) =>
                                item.id === event.id
                                  ? {
                                      ...item,
                                      startAt: updateDateTimeValue(
                                        item.startAt,
                                        "date",
                                        e.target.value,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                          aria-label="Date"
                        />
                        <input
                          type="time"
                          className="h-8 w-full rounded border px-2 text-xs"
                          value={getTimePart(event.startAt)}
                          onChange={(e) =>
                            setEventTemplates((current) =>
                              current.map((item) =>
                                item.id === event.id
                                  ? {
                                      ...item,
                                      startAt: updateDateTimeValue(
                                        item.startAt,
                                        "time",
                                        e.target.value,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                          aria-label="Heure"
                        />
                      </div>
                    </td>
                    <td className="hidden xl:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.feeOnlineCents}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, feeOnlineCents: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Frais en ligne"
                      />
                    </td>
                    <td className="hidden xl:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.feeOnsiteCents}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, feeOnsiteCents: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Frais sur place"
                      />
                    </td>
                    <td className="hidden md:table-cell py-2 pr-2">
                      <select
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.status}
                        onChange={(e) =>
                          setEventTemplates((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? {
                                    ...item,
                                    status: e.target.value as EventTemplateForm["status"],
                                  }
                                : item,
                            ),
                          )
                        }
                        aria-label="Statut"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="FULL">FULL</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <div className="relative" data-action-menu>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded border hover:bg-muted"
                          onClick={() =>
                            setOpenActionId((current) =>
                              current === event.id ? null : event.id,
                            )
                          }
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openActionId === event.id ? (
                          <div className="absolute right-0 z-20 mt-2 w-32 rounded-md border bg-popover p-1 shadow-md">
                            <button
                              type="button"
                              className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                              onClick={() => {
                                updateEventTemplate(event);
                                setOpenActionId(null);
                              }}
                              disabled={savingEvent === event.id}
                            >
                              {savingEvent === event.id ? "..." : "Sauver"}
                            </button>
                            <button
                              type="button"
                              className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                              onClick={() => {
                                deleteEventTemplate(event.id);
                                setOpenActionId(null);
                              }}
                              disabled={savingEvent === event.id}
                            >
                              Supprimer
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
















