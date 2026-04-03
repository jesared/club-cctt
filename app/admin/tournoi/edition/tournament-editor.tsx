"use client";

import { useEffect, useMemo, useState } from "react";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TournamentForm = {
  id: string;
  slug: string;
  name: string;
  description: string;
  venue: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
};

type EventForm = {
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

type TournamentEditorEventPayload = {
  id: string;
  code?: string | null;
  label?: string | null;
  gender?: EventForm["gender"] | null;
  minPoints?: number | null;
  maxPoints?: number | null;
  maxPlayers?: number | null;
  startAt?: string | null;
  feeOnlineCents?: number | null;
  feeOnsiteCents?: number | null;
  status?: EventForm["status"] | null;
};

type TournamentEditorPayload = {
  id: string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  venue?: string | null;
  registrationOpenAt?: string | null;
  registrationCloseAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: TournamentForm["status"] | null;
  events?: TournamentEditorEventPayload[] | null;
};

type TournamentEditorResponse = {
  error?: string;
  tournament?: TournamentEditorPayload | null;
  event?: TournamentEditorEventPayload | null;
};

type TournamentEditorProps = {
  tournamentId: string;
};

const emptyTournament: TournamentForm = {
  id: "",
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

const emptyEvent: EventForm = {
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

async function readJson<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function toEventForm(event: TournamentEditorEventPayload): EventForm {
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

export function TournamentEditor({ tournamentId }: TournamentEditorProps) {
  const [tournament, setTournament] = useState<TournamentForm>(emptyTournament);
  const [events, setEvents] = useState<EventForm[]>([]);
  const [newEvent, setNewEvent] = useState<EventForm>(emptyEvent);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingTournament, setSavingTournament] = useState(false);
  const [savingEvent, setSavingEvent] = useState<string | null>(null);
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

  const editable = useMemo(() => {
    if (!tournament.startDate) return false;
    const start = new Date(tournament.startDate);
    if (Number.isNaN(start.getTime())) return false;
    return Date.now() < start.getTime();
  }, [tournament.startDate]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/admin/tournoi/${tournamentId}`);
        const json = await readJson<TournamentEditorResponse>(res);
        if (!res.ok) {
          const statusInfo = `${res.status} ${res.statusText || "Erreur"}`.trim();
          setLoadError(
            [json?.error, statusInfo].filter(Boolean).join(" — ") ||
              "Chargement impossible.",
          );
          return;
        }

        const tournamentData = json?.tournament;
        if (!tournamentData) {
          setLoadError("Tournoi introuvable.");
          return;
        }

        setTournament({
          id: tournamentData.id,
          slug: tournamentData.slug ?? "",
          name: tournamentData.name ?? "",
          description: tournamentData.description ?? "",
          venue: tournamentData.venue ?? "",
          registrationOpenAt: toInputValue(tournamentData.registrationOpenAt),
          registrationCloseAt: toInputValue(tournamentData.registrationCloseAt),
          startDate: toInputValue(tournamentData.startDate),
          endDate: toInputValue(tournamentData.endDate),
          status: tournamentData.status ?? "DRAFT",
        });

        const eventList = (tournamentData.events ?? []).map(toEventForm);

        setEvents(eventList);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tournamentId]);

  async function saveTournament() {
    if (!editable) {
      alert("Le tournoi a deja demarre.");
      return;
    }
    setSavingTournament(true);
    try {
      const res = await fetch(`/api/admin/tournoi/${tournamentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tournament),
      });
      const json = await readJson<TournamentEditorResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Enregistrement impossible.");
        return;
      }
      alert("Tournoi mis a jour.");
    } finally {
      setSavingTournament(false);
    }
  }

  async function createEvent() {
    if (!editable) {
      alert("Le tournoi a deja demarre.");
      return;
    }
    setSavingEvent("new");
    try {
      const res = await fetch(`/api/admin/tournoi/${tournamentId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      const json = await readJson<TournamentEditorResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Creation impossible.");
        return;
      }
      if (!json?.event) {
        alert("Tableau ajoute.");
        return;
      }
      const createdEvent = json.event;
      setEvents((current) => [...current, toEventForm(createdEvent)]);
      setNewEvent(emptyEvent);
    } finally {
      setSavingEvent(null);
    }
  }

  async function updateEvent(event: EventForm) {
    if (!editable) {
      alert("Le tournoi a deja demarre.");
      return;
    }
    setSavingEvent(event.id);
    try {
      const res = await fetch(
        `/api/admin/tournoi/${tournamentId}/events/${event.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        },
      );
      const json = await readJson<TournamentEditorResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Mise a jour impossible.");
        return;
      }
      alert("Tableau mis a jour.");
    } finally {
      setSavingEvent(null);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Supprimer ce tableau ?")) return;
    if (!editable) {
      alert("Le tournoi a deja demarre.");
      return;
    }
    setSavingEvent(id);
    try {
      const res = await fetch(
        `/api/admin/tournoi/${tournamentId}/events/${id}`,
        { method: "DELETE" },
      );
      const json = await readJson<TournamentEditorResponse>(res);
      if (!res.ok) {
        alert(json?.error ?? "Suppression impossible.");
        return;
      }
      setEvents((current) => current.filter((item) => item.id !== id));
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
        <p className="font-medium text-foreground">Impossible de charger.</p>
        <p className="mt-1">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!editable ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Le tournoi a deja demarre. Les modifications sont bloquees.
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tournoi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 text-sm">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</label>
            <input
              className="w-full rounded border px-2.5 py-1.5 text-sm"
              value={tournament.slug}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }
              disabled={!editable}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nom</label>
            <input
              className="w-full rounded border px-2.5 py-1.5 text-sm"
              value={tournament.name}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              disabled={!editable}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</label>
            <textarea
              className="w-full rounded border px-2.5 py-1.5 text-sm"
              rows={2}
              value={tournament.description}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              disabled={!editable}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lieu</label>
            <input
              className="w-full rounded border px-2.5 py-1.5 text-sm"
              value={tournament.venue}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  venue: event.target.value,
                }))
              }
              disabled={!editable}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2 has-calendar-icon">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ouverture inscriptions</label>
              <input
                type="datetime-local"
                className="w-full rounded border px-2.5 py-1.5 text-sm pr-9"
                value={tournament.registrationOpenAt}
                onChange={(event) =>
                  setTournament((current) => ({
                    ...current,
                    registrationOpenAt: event.target.value,
                  }))
                }
                disabled={!editable}
              />
            </div>
            <div className="grid gap-2 has-calendar-icon">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fermeture inscriptions</label>
              <input
                type="datetime-local"
                className="w-full rounded border px-2.5 py-1.5 text-sm pr-9"
                value={tournament.registrationCloseAt}
                onChange={(event) =>
                  setTournament((current) => ({
                    ...current,
                    registrationCloseAt: event.target.value,
                  }))
                }
                disabled={!editable}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2 has-calendar-icon">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Debut tournoi</label>
              <input
                type="datetime-local"
                className="w-full rounded border px-2.5 py-1.5 text-sm pr-9"
                value={tournament.startDate}
                onChange={(event) =>
                  setTournament((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                disabled={!editable}
              />
            </div>
            <div className="grid gap-2 has-calendar-icon">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fin tournoi</label>
              <input
                type="datetime-local"
                className="w-full rounded border px-2.5 py-1.5 text-sm pr-9"
                value={tournament.endDate}
                onChange={(event) =>
                  setTournament((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                disabled={!editable}
              />
            </div>
          </div>
          <div className="grid gap-2 max-w-xs">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statut</label>
            <select
              className="w-full rounded border px-2.5 py-1.5 text-sm"
              value={tournament.status}
              onChange={(event) =>
                setTournament((current) => ({
                  ...current,
                  status: event.target.value as TournamentForm["status"],
                }))
              }
              disabled={!editable}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={saveTournament} disabled={savingTournament || !editable}>
              {savingTournament ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tableaux</CardTitle>
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
                  <th className="py-2 pr-2 font-semibold w-40">Date/heure</th>
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
                      disabled={!editable}
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
                      disabled={!editable}
                    />
                  </td>
                  <td className="hidden md:table-cell py-2 pr-2">
                    <select
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.gender}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          gender: event.target.value as EventForm["gender"],
                        }))
                      }
                      aria-label="Genre"
                      disabled={!editable}
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
                      disabled={!editable}
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
                      disabled={!editable}
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
                      disabled={!editable}
                    />
                  </td>
                  <td className="py-2 pr-2 has-calendar-icon">
                    <input
                      type="datetime-local"
                      className="h-8 w-full rounded border px-2 text-xs pr-8"
                      value={newEvent.startAt}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          startAt: event.target.value,
                        }))
                      }
                      aria-label="Date / heure"
                      disabled={!editable}
                    />
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
                      disabled={!editable}
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
                      disabled={!editable}
                    />
                  </td>
                  <td className="hidden md:table-cell py-2 pr-2">
                    <select
                      className="h-8 w-full rounded border px-2 text-xs"
                      value={newEvent.status}
                      onChange={(event) =>
                        setNewEvent((current) => ({
                          ...current,
                          status: event.target.value as EventForm["status"],
                        }))
                      }
                      aria-label="Statut"
                      disabled={!editable}
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
                      size="sm"
                      onClick={createEvent}
                      disabled={savingEvent === "new" || !editable}
                    >
                      {savingEvent === "new" ? "Création..." : "Ajouter"}
                    </Button>
                  </td>
                </tr>

                {events.map((event) => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.code}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, code: e.target.value.toUpperCase() }
                                : item,
                            ),
                          )
                        }
                        aria-label="Code"
                        disabled={!editable}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.label}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, label: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Label"
                        disabled={!editable}
                      />
                    </td>
                    <td className="hidden md:table-cell py-2 pr-2">
                      <select
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.gender}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? {
                                    ...item,
                                    gender: e.target.value as EventForm["gender"],
                                  }
                                : item,
                            ),
                          )
                        }
                        aria-label="Genre"
                        disabled={!editable}
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
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, minPoints: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Min points"
                        disabled={!editable}
                      />
                    </td>
                    <td className="hidden lg:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.maxPoints}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, maxPoints: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Max points"
                        disabled={!editable}
                      />
                    </td>
                    <td className="hidden lg:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.maxPlayers}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, maxPlayers: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Max joueurs"
                        disabled={!editable}
                      />
                    </td>
                    <td className="py-2 pr-2 has-calendar-icon">
                      <input
                        type="datetime-local"
                        className="h-8 w-full rounded border px-2 text-xs pr-8"
                        value={event.startAt}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, startAt: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Date / heure"
                        disabled={!editable}
                      />
                    </td>
                    <td className="hidden xl:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.feeOnlineCents}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, feeOnlineCents: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Frais en ligne"
                        disabled={!editable}
                      />
                    </td>
                    <td className="hidden xl:table-cell py-2 pr-2">
                      <input
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.feeOnsiteCents}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? { ...item, feeOnsiteCents: e.target.value }
                                : item,
                            ),
                          )
                        }
                        aria-label="Frais sur place"
                        disabled={!editable}
                      />
                    </td>
                    <td className="hidden md:table-cell py-2 pr-2">
                      <select
                        className="h-8 w-full rounded border px-2 text-xs"
                        value={event.status}
                        onChange={(e) =>
                          setEvents((current) =>
                            current.map((item) =>
                              item.id === event.id
                                ? {
                                    ...item,
                                    status: e.target.value as EventForm["status"],
                                  }
                                : item,
                            ),
                          )
                        }
                        aria-label="Statut"
                        disabled={!editable}
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
                          disabled={!editable}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openActionId === event.id ? (
                          <div className="absolute right-0 z-20 mt-2 w-32 rounded-md border bg-popover p-1 shadow-md">
                            <button
                              type="button"
                              className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                              onClick={() => {
                                updateEvent(event);
                                setOpenActionId(null);
                              }}
                              disabled={savingEvent === event.id || !editable}
                            >
                              {savingEvent === event.id ? "..." : "Sauver"}
                            </button>
                            <button
                              type="button"
                              className="w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                              onClick={() => {
                                deleteEvent(event.id);
                                setOpenActionId(null);
                              }}
                              disabled={savingEvent === event.id || !editable}
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









