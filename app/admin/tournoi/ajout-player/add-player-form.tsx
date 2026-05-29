"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TournamentTable = {
  id: string;
  dayKey: string;
  date: string;
  time: string;
  table: string;
  category: string;
  onsitePayment: string;
  minPoints: number | null;
  maxPoints: number | null;
  gender: "MIXED" | "M" | "F";
};

type PlayerGender = "M" | "F" | "";

type PlayerFormState = {
  nom: string;
  prenom: string;
  licence: string;
  points: string;
  gender: PlayerGender;
  club: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  eventIds: string[];
};

type FfttLookupState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

type FfttLookupResponse = {
  player?: {
    licence: string;
    nom: string;
    prenom: string;
    points: number | null;
    club: string;
    gender: PlayerGender;
  };
  error?: string;
};

type Props = {
  tournamentId: string;
  tournamentTables: TournamentTable[];
  action: (formData: FormData) => void;
  deleteAction?: (formData: FormData) => void;
  initialData?: {
    registrationId: string;
    nom: string;
    prenom: string;
    licence: string;
    points: string;
    gender: PlayerGender;
    club: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
    eventIds: string[];
  };
  submitLabel?: string;
  cancelHref?: string;
};

function isEligible(
  points: number | null,
  gender: PlayerGender,
  table: TournamentTable,
) {
  if (table.gender === "F" && gender !== "F") {
    return false;
  }

  if (table.gender === "M" && gender !== "M") {
    return false;
  }

  if (points === null) {
    return true;
  }

  if (table.minPoints !== null && points < table.minPoints) {
    return false;
  }

  if (table.maxPoints !== null && points > table.maxPoints) {
    return false;
  }

  return true;
}

function formatGender(gender: PlayerGender) {
  if (gender === "F") {
    return "Féminin";
  }

  if (gender === "M") {
    return "Masculin";
  }

  return "";
}

function ReadOnlyInfoItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline gap-1.5 whitespace-nowrap ${className}`.trim()}
    >
      <span className="shrink-0 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label} :
      </span>
      <span className="text-sm font-semibold text-foreground">{value || "-"}</span>
    </div>
  );
}

export function AddPlayerForm({
  tournamentId,
  tournamentTables,
  action,
  deleteAction,
  initialData,
  submitLabel,
  cancelHref,
}: Props) {
  const editMode = Boolean(initialData);
  const formId = `admin-tournoi-player-form-${initialData?.registrationId ?? tournamentId}`;
  const [formData, setFormData] = useState<PlayerFormState>(() => ({
    nom: initialData?.nom ?? "",
    prenom: initialData?.prenom ?? "",
    licence: initialData?.licence ?? "",
    points: initialData?.points ?? "",
    gender: initialData?.gender ?? "",
    club: initialData?.club ?? "",
    contactEmail: initialData?.contactEmail ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    notes: initialData?.notes ?? "",
    eventIds: initialData?.eventIds ?? ([] as string[]),
  }));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ffttLookup, setFfttLookup] = useState<FfttLookupState>({
    status: initialData ? "success" : "idle",
    message: initialData ? "Données joueur chargées depuis l'inscription." : "",
  });
  const playerDisplayName =
    `${formData.prenom} ${formData.nom}`.trim() ||
    formData.licence ||
    "ce joueur";

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      nom: initialData.nom,
      prenom: initialData.prenom,
      licence: initialData.licence,
      points: initialData.points,
      gender: initialData.gender,
      club: initialData.club,
      contactEmail: initialData.contactEmail,
      contactPhone: initialData.contactPhone,
      notes: initialData.notes,
      eventIds: initialData.eventIds,
    });
    setFfttLookup({
      status: "success",
      message: "Données joueur chargées depuis l'inscription.",
    });
  }, [initialData]);

  const tournamentTableById = useMemo(
    () => new Map(tournamentTables.map((table) => [table.id, table])),
    [tournamentTables],
  );

  const parsedPoints = useMemo(() => {
    if (!formData.points.trim()) {
      return null;
    }

    const numericPoints = Number.parseInt(formData.points, 10);
    return Number.isNaN(numericPoints) ? null : numericPoints;
  }, [formData.points]);

  const groupedTournamentTables = useMemo(() => {
    const groups = new Map<string, { date: string; tables: TournamentTable[] }>();

    for (const table of tournamentTables) {
      const existingGroup = groups.get(table.dayKey);
      if (existingGroup) {
        existingGroup.tables.push(table);
      } else {
        groups.set(table.dayKey, { date: table.date, tables: [table] });
      }
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dayKey, group]) => ({
        dayKey,
        date: group.date,
        tables: group.tables,
      }));
  }, [tournamentTables]);

  const ineligibleTableCodes = useMemo(
    () =>
      tournamentTables
        .filter((table) => !isEligible(parsedPoints, formData.gender, table))
        .map((table) => table.table),
    [formData.gender, parsedPoints, tournamentTables],
  );

  function keepEligibleEventIds(
    eventIds: string[],
    pointsValue: string,
    gender: PlayerGender,
  ) {
    const nextPoints = Number.parseInt(pointsValue, 10);

    if (!pointsValue.trim() || Number.isNaN(nextPoints)) {
      return eventIds.filter((eventId) => {
        const table = tournamentTableById.get(eventId);
        return table ? isEligible(null, gender, table) : false;
      });
    }

    return eventIds.filter((eventId) => {
      const table = tournamentTableById.get(eventId);
      return table ? isEligible(nextPoints, gender, table) : false;
    });
  }

  async function lookupFfttLicense() {
    const licence = formData.licence.trim();

    if (!licence) {
      setFfttLookup({
        status: "error",
        message: "Renseignez d'abord un numero de licence.",
      });
      return;
    }

    setFfttLookup({
      status: "loading",
      message: "Recherche FFTT en cours...",
    });

    try {
      const response = await fetch(
        `/api/admin/tournoi/fftt/license?licence=${encodeURIComponent(licence)}`,
      );
      const data = (await response.json().catch(() => ({}))) as FfttLookupResponse;

      if (!response.ok || !data.player) {
        throw new Error(data.error || "Joueur FFTT introuvable.");
      }

      setFormData((current) => {
        const nextPoints =
          data.player?.points !== null && data.player?.points !== undefined
            ? data.player.points.toString()
            : current.points;
        const nextGender = data.player?.gender ?? current.gender;

        return {
          ...current,
          nom: data.player?.nom || current.nom,
          prenom: data.player?.prenom || current.prenom,
          licence: data.player?.licence || current.licence,
          points: nextPoints,
          gender: nextGender,
          club: data.player?.club || current.club,
          eventIds: keepEligibleEventIds(
            current.eventIds,
            nextPoints,
            nextGender,
          ),
        };
      });

      setFfttLookup({
        status: "success",
        message:
          "Infos FFTT recuperees : nom, prenom, genre, club et classement.",
      });
    } catch (error) {
      setFfttLookup({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible de recuperer les infos FFTT.",
      });
    }
  }

  const infoMessage = useMemo(() => {
    if (!formData.points.trim()) {
      return "Renseignez le classement pour filtrer automatiquement les tableaux disponibles.";
    }

    if (parsedPoints === null || parsedPoints < 0) {
      return "Classement invalide : veuillez saisir un nombre positif.";
    }

    if (ineligibleTableCodes.length === 0) {
      return "Tous les tableaux sont disponibles pour ce classement.";
    }

    return `Tableaux indisponibles pour ce profil FFTT : ${ineligibleTableCodes.join(", ")}.`;
  }, [formData.points, ineligibleTableCodes, parsedPoints]);

  const hasFfttPlayer = ffttLookup.status === "success";
  const canSubmit =
    hasFfttPlayer && formData.gender !== "" && formData.eventIds.length > 0;

  return (
    <form id={formId} action={action} className="space-y-6">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      {initialData ? (
        <input type="hidden" name="registrationId" value={initialData.registrationId} />
      ) : null}

      <section className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">1. Données FFTT</p>
          <p className="text-xs text-muted-foreground">
            {editMode
              ? "Ces informations proviennent de la FFTT et sont affichées à titre informatif uniquement."
              : "Saisissez le numéro de licence pour récupérer automatiquement l&apos;identité, le genre, le club et le classement."}
          </p>
        </div>

        {editMode ? (
          <>
            <input type="hidden" name="licence" value={formData.licence} />
            <input type="hidden" name="nom" value={formData.nom} />
            <input type="hidden" name="prenom" value={formData.prenom} />
            <input type="hidden" name="points" value={formData.points} />
            <input type="hidden" name="club" value={formData.club} />
            {formData.gender ? (
              <input type="hidden" name="gender" value={formData.gender} />
            ) : null}
            <div className="overflow-hidden rounded-xl border border-border bg-background/55">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
                <ReadOnlyInfoItem label="Licence" value={formData.licence} />
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-border/80 md:block"
                />
                <ReadOnlyInfoItem label="Nom" value={formData.nom} />
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-border/80 md:block"
                />
                <ReadOnlyInfoItem label="Prénom" value={formData.prenom} />
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-border/80 md:block"
                />
                <ReadOnlyInfoItem
                  label="Classement"
                  value={formData.points}
                />
              </div>
              <div className="border-t border-border/80 px-4 py-3">
                <ReadOnlyInfoItem label="Club" value={formData.club} />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-1 text-sm">
            <label htmlFor="licence" className="font-medium">
              Licence *
            </label>
            <div className="flex gap-2">
              <input
                id="licence"
                name="licence"
                required
                value={formData.licence}
                onChange={(event) => {
                  const nextLicence = event.target.value;
                  setFormData((current) => ({
                    ...current,
                    licence: nextLicence,
                    nom: "",
                    prenom: "",
                    points: "",
                    gender: "",
                    club: "",
                    eventIds: [],
                  }));
                  setFfttLookup({ status: "idle", message: "" });
                }}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="1234567"
              />
              <button
                type="button"
                disabled={
                  !formData.licence.trim() || ffttLookup.status === "loading"
                }
                onClick={lookupFfttLicense}
                className="inline-flex cursor-pointer items-center rounded-md border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {ffttLookup.status === "loading" ? "Recherche..." : "FFTT"}
              </button>
            </div>
            {ffttLookup.status !== "idle" ? (
              <p
                className={`text-xs ${
                  ffttLookup.status === "error"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {ffttLookup.message}
              </p>
            ) : null}
          </div>
        )}

        {!editMode && hasFfttPlayer ? (
          <div className="grid gap-3 rounded-lg border border-border bg-background/80 p-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Nom</span>
              <input
                name="nom"
                readOnly
                required
                value={formData.nom}
                className="w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Prénom</span>
              <input
                name="prenom"
                readOnly
                required
                value={formData.prenom}
                className="w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Classement</span>
              <input
                name="points"
                readOnly
                required
                value={formData.points}
                className="w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </label>
            {formData.gender ? (
              <>
                <input type="hidden" name="gender" value={formData.gender} />
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Genre</span>
                  <input
                    readOnly
                    value={formatGender(formData.gender)}
                    className="w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus:outline-none"
                  />
                </label>
              </>
            ) : (
              <label className="space-y-1 text-sm">
                <span className="font-medium">Genre *</span>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={(event) => {
                    const nextGender = event.target.value as PlayerGender;
                    setFormData((current) => ({
                      ...current,
                      gender: nextGender,
                      eventIds: keepEligibleEventIds(
                        current.eventIds,
                        current.points,
                        nextGender,
                      ),
                    }));
                  }}
                  className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </label>
            )}
            <label className="space-y-1 text-sm">
              <span className="font-medium">Club</span>
              <input
                name="club"
                readOnly
                required
                value={formData.club}
                className="w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </label>
          </div>
        ) : !editMode ? (
          <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-5 text-sm text-muted-foreground">
            Les informations joueur et la suite du formulaire s&apos;afficheront
            après une recherche FFTT réussie.
          </div>
        ) : null}
      </section>

      {hasFfttPlayer ? (
        <>
          <section className="space-y-5 rounded-xl border border-border bg-card p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                2. Données complémentaires
              </p>
              <p className="text-xs text-muted-foreground">
                Ces informations ne sont pas fournies par la FFTT et restent à
                compléter pour l&apos;organisation du tournoi.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Email *</span>
                <input
                  name="contactEmail"
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      contactEmail: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="joueur@email.fr"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Téléphone *</span>
                <input
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      contactPhone: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="06 12 34 56 78"
                />
              </label>
            </div>
          </section>

          <fieldset className="space-y-3 rounded-xl border border-border bg-card p-4">
            <legend className="px-1 text-sm font-semibold">
              3. Tableaux à inscrire *
            </legend>
            <p className="text-sm text-muted-foreground">
              Sélectionnez un ou plusieurs tableaux compatibles avec le
              profil FFTT récupéré.
            </p>
            <p className="rounded-md border border-border bg-accent/25 px-3 py-2 text-xs text-foreground/80">
              {infoMessage}
            </p>
            <div className="space-y-4">
              {groupedTournamentTables.map((group) => (
                <div key={group.dayKey} className="space-y-2">
                  <p className="text-sm font-semibold capitalize">
                    {group.date}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.tables.map((table) => {
                      const eligible = isEligible(
                        parsedPoints,
                        formData.gender,
                        table,
                      );

                      return (
                        <label
                          key={table.id}
                          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                            eligible
                              ? "border-border"
                              : "cursor-not-allowed border-border bg-muted/90 text-muted-foreground line-through"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="eventIds"
                            value={table.id}
                            checked={formData.eventIds.includes(table.id)}
                            disabled={!eligible}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setFormData((current) => {
                                const nextEventIds = isChecked
                                  ? [...current.eventIds, table.id]
                                  : current.eventIds.filter(
                                      (eventId) => eventId !== table.id,
                                    );

                                return {
                                  ...current,
                                  eventIds: nextEventIds,
                                };
                              });
                            }}
                            className="mt-1 accent-primary"
                          />
                          <span>
                            <span className="block font-semibold text-foreground">
                              Tableau {table.table}
                            </span>
                            <span className="block text-muted-foreground">
                              {table.category}
                            </span>
                            <span className="block text-muted-foreground">
                              {table.time} - Sur place : {table.onsitePayment}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Notes internes</span>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Informations complémentaires (paiement, disponibilité, etc.)"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex cursor-pointer items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLabel ?? "Ajouter le joueur"}
              </button>
              {cancelHref ? (
                <Link
                  href={cancelHref}
                  className="inline-flex cursor-pointer items-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted/60"
                >
                  Annuler
                </Link>
              ) : null}
            </div>

            {deleteAction && initialData ? (
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-6 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/15"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Supprimer le joueur
                </button>

                <DialogContent className="max-w-md p-0">
                  <DialogHeader className="border-b border-destructive/10 bg-destructive/5 px-6 py-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <DialogTitle className="text-lg">
                          Supprimer ce joueur ?
                        </DialogTitle>
                        <DialogDescription className="mt-1 leading-6">
                          Cette action supprimera le joueur du tournoi, ses
                          tableaux, pointages et paiements associés.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-3 px-6 py-5 text-sm">
                    <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Joueur concerné
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {playerDisplayName}
                      </p>
                      {formData.licence ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Licence {formData.licence}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground">
                      La suppression est définitive. Vérifiez que vous n&apos;avez
                      plus besoin de conserver ce dossier tournoi.
                    </p>
                  </div>

                  <DialogFooter className="border-t border-border/60 px-6 py-5">
                    <DialogClose asChild>
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60"
                      >
                        Annuler
                      </button>
                    </DialogClose>
                    <button
                      type="submit"
                      form={formId}
                      formAction={deleteAction}
                      formNoValidate
                      className="inline-flex cursor-pointer items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
                    >
                      Confirmer la suppression
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
        </>
      ) : null}
    </form>
  );
}




