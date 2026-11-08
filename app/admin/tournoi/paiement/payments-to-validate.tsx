"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { FolderOpen, Search, Undo2, X } from "lucide-react";
import type { AdminPaymentGroupRow } from "../data";
import type { PaymentMethod } from "@prisma/client";
import { paymentMethodLabels } from "./payment-history";
import {
  updatePaymentGroupNote,
  recordPayment,
  recordRefund,
} from "./actions";

type PaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE" | "REMBOURSÉ";
type FilterStatus = "TOUS" | PaymentStatus;

type PaymentDossier = {
  groupKey: string;
  payerName: string;
  payerEmail: string | null;
  payerPhone: string | null;
  payerLabel: string;
  registrations: number;
  players: string[];
  playerDetails: AdminPaymentGroupRow["playerDetails"];
  paymentHistory: AdminPaymentGroupRow["paymentHistory"];
  totalAmountDueCents: number;
  totalPaidCents: number;
  remainingCents: number;
  paymentStatus: PaymentStatus;
  statusLabel: string;
  dossierType: string;
  priority: "HAUTE" | "NORMALE";
  suggestedAction: string;
  hasPaymentMismatch?: boolean;
  note?: string | null;
  noteMismatch?: boolean;
};

type Props = {
  initialPayments: PaymentDossier[];
  defaultStatusFilter?: FilterStatus;
  initialSelectedGroupKey?: string | null;
};

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
});

function formatEuro(cents: number) {
  return euroFormatter.format(cents / 100);
}

const paymentDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function PaymentsToValidate({
  initialPayments,
  defaultStatusFilter,
  initialSelectedGroupKey,
}: Props) {
  const [payments, setPayments] = useState(initialPayments);
  useEffect(() => setPayments(initialPayments), [initialPayments]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(
    () =>
      initialPayments.some(
        (payment) => payment.groupKey === initialSelectedGroupKey,
      )
        ? initialSelectedGroupKey ?? null
        : null,
  );
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(
    defaultStatusFilter ?? "TOUS",
  );
  const [nameFilter, setNameFilter] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const nameFilterRef = useRef<HTMLInputElement | null>(null);
  const [manualPaidValue, setManualPaidValue] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [refund, setRefund] = useState<{
    paymentId: string;
    operationId: string;
    error?: string;
  } | null>(null);
  const paymentAttempt = useRef<{ key: string; id: string } | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [savedNoteValue, setSavedNoteValue] = useState("");

  const selectedPayment = useMemo(
    () => payments.find((group) => group.groupKey === selectedGroupKey) ?? null,
    [payments, selectedGroupKey],
  );

  const filteredPayments = useMemo(() => {
    const normalizedNameFilter = nameFilter.trim().toLowerCase();

    return payments.filter((group) => {
      if (statusFilter !== "TOUS" && group.paymentStatus !== statusFilter) {
        return false;
      }

      if (!normalizedNameFilter) {
        return true;
      }

      return (
        group.payerName.toLowerCase().includes(normalizedNameFilter) ||
        group.payerLabel.toLowerCase().includes(normalizedNameFilter)
      );
    });
  }, [payments, statusFilter, nameFilter]);

  const statusCounts = useMemo(() => {
    return payments.reduce(
      (acc, group) => {
        acc.total += 1;
        if (group.paymentStatus === "EN ATTENTE") acc.pending += 1;
        if (group.paymentStatus === "PARTIEL") acc.partial += 1;
        if (group.paymentStatus === "PAYÉ") acc.paid += 1;
        if (group.paymentStatus === "REMBOURSÉ") acc.refunded += 1;
        return acc;
      },
      { total: 0, pending: 0, partial: 0, paid: 0, refunded: 0 },
    );
  }, [payments]);

  const relancePayments = useMemo(
    () => payments.filter((group) => group.remainingCents > 0),
    [payments],
  );

  useEffect(() => {
    if (!focusMode) return;
    nameFilterRef.current?.focus();
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [focusMode]);

  useEffect(() => {
    if (!selectedPayment) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPayment]);

  useEffect(() => {
    setManualPaidValue(null);
    setPaymentMethod("");
    setPaymentError(null);
    setRefund(null);
  }, [selectedGroupKey]);

  const selectedNote = selectedPayment?.note ?? "";
  useEffect(() => {
    setNoteValue(selectedNote);
    setSavedNoteValue(selectedNote);
  }, [selectedGroupKey, selectedNote]);

  useEffect(() => {
    if (!defaultStatusFilter) return;
    setStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  useEffect(() => {
    if (!focusMode) return;
    if (selectedPayment) return;
    if (filteredPayments.length === 0) return;
    setFocusedIndex((current) => {
      if (current >= 0 && current < filteredPayments.length) {
        return current;
      }
      return 0;
    });
  }, [focusMode, filteredPayments.length, selectedPayment]);

  useEffect(() => {
    if (!focusMode) return;
    if (selectedPayment) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((current) => {
          if (filteredPayments.length === 0) return -1;
          const next = current + 1;
          return next >= filteredPayments.length ? 0 : next;
        });
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((current) => {
          if (filteredPayments.length === 0) return -1;
          const next = current - 1;
          return next < 0 ? filteredPayments.length - 1 : next;
        });
      }
      if (event.key === "Enter") {
        if (focusedIndex >= 0 && focusedIndex < filteredPayments.length) {
          setSelectedGroupKey(filteredPayments[focusedIndex].groupKey);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusMode, filteredPayments, focusedIndex, selectedPayment]);

  const closeModal = () => setSelectedGroupKey(null);

  const saveNoteOnly = useCallback(() => {
    if (!selectedPayment || isPending) return;

    const targetGroupKey = selectedPayment.groupKey;
    const note = noteValue;

    startTransition(async () => {
      const result = await updatePaymentGroupNote(targetGroupKey, note);

      if (!result.ok) {
        setToastMessage(result.error ?? "Mise à jour impossible.");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      setSavedNoteValue(note);
      setPayments((current) =>
        current.map<PaymentDossier>((group): PaymentDossier => {
          if (group.groupKey !== targetGroupKey) {
            return group;
          }
          return {
            ...group,
            note,
            noteMismatch: false,
          };
        }),
      );

      setToastMessage("Note enregistrée.");
      setTimeout(() => setToastMessage(null), 2500);
    });
  }, [isPending, noteValue, selectedPayment, startTransition]);

  useEffect(() => {
    if (!selectedPayment) return;
    if (noteValue.trim() === savedNoteValue.trim()) return;
    if (isPending) return;

    const timeout = setTimeout(() => {
      saveNoteOnly();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [noteValue, savedNoteValue, selectedPayment, isPending, saveNoteOnly]);

  const remainingCents = selectedPayment?.remainingCents ?? 0;
  const refundedCents = selectedPayment?.paymentHistory.reduce(
    (total, entry) => total + Math.max(-entry.amountCents, 0),
    0,
  ) ?? 0;
  const paymentValue = manualPaidValue ?? (remainingCents / 100).toFixed(2);
  const amountCents = Math.round(Number(paymentValue) * 100);
  const canRecordPayment =
    paymentMethod !== "" &&
    /^\d+(?:\.\d{1,2})?$/.test(paymentValue) &&
    amountCents > 0 &&
    amountCents <= remainingCents;

  const saveManualPaidAmount = () => {
    if (!selectedPayment || !canRecordPayment || !paymentMethod || isPending) return;

    const groupKey = selectedPayment.groupKey;
    const attemptKey = JSON.stringify([groupKey, amountCents, paymentMethod]);
    if (paymentAttempt.current?.key !== attemptKey) {
      paymentAttempt.current = { key: attemptKey, id: crypto.randomUUID() };
    }
    const operationId = paymentAttempt.current.id;

    setPaymentError(null);
    startTransition(async () => {
      try {
        const result = await recordPayment(groupKey, amountCents, paymentMethod, operationId);
        if (!result.ok) {
          setPaymentError(result.error);
          return;
        }

        paymentAttempt.current = null;
        setManualPaidValue(null);
        setPaymentMethod("");
        setToastMessage("Versement enregistré.");
        setTimeout(() => setToastMessage(null), 2500);
      } catch {
        setPaymentError("Impossible de confirmer le versement. Réessayez avec les mêmes informations.");
      }
    });
  };

  const exportRelanceCsv = () => {
    if (relancePayments.length === 0) {
      setToastMessage("Aucun dossier à relancer.");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const header = [
      "Payeur",
      "Email",
      "Telephone",
      "Statut",
      "Reste",
      "Inscriptions",
      "Joueurs",
    ];

    const rows = relancePayments.map((group) => [
      group.payerName,
      group.payerEmail ?? "",
      group.payerPhone ?? "",
      group.statusLabel,
      `${(group.remainingCents / 100).toFixed(0)} EUR`,
      `${group.registrations}`,
      group.players.join(", "),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dossiers-a-relancer.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const content = (
    <>
      <div
        className={`space-y-3 rounded-lg border border-border bg-muted/20 p-3 sm:p-4 ${
          focusMode ? "" : "mt-4"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par statut">
          {[
            { value: "TOUS" as const, label: "Tous", count: statusCounts.total },
            { value: "EN ATTENTE" as const, label: "En attente", count: statusCounts.pending },
            { value: "PARTIEL" as const, label: "À régulariser", count: statusCounts.partial },
            { value: "PAYÉ" as const, label: "Payés", count: statusCounts.paid },
            { value: "REMBOURSÉ" as const, label: "Remboursés", count: statusCounts.refunded },
          ].map((chip) => {
            const active = statusFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(chip.value)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {chip.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <label className="relative min-w-0 basis-full grow sm:basis-56" htmlFor="payment-name-filter">
            <span className="sr-only">Rechercher un payeur</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="payment-name-filter"
            type="search"
            ref={nameFilterRef}
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Rechercher un payeur…"
          />
        </label>

        <button
          type="button"
          className="h-10 shrink-0 whitespace-nowrap rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
          onClick={exportRelanceCsv}
        >
          Export relance ({relancePayments.length})
        </button>

        <button
          type="button"
          className="h-10 shrink-0 whitespace-nowrap rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => setFocusMode((current) => !current)}
        >
          {focusMode ? "Quitter mode caisse" : "Mode caisse"}
        </button>
        </div>

        {focusMode ? (
          <div className="ml-auto text-xs text-muted-foreground md:text-[11px]">
            ↑/↓ naviguer · Entrée ouvrir · Esc fermer
          </div>
        ) : null}
      </div>

      <div className={`overflow-x-auto rounded-lg border border-border ${focusMode ? "flex-1" : "mt-4"}`}>
        <table className="w-full min-w-[34rem] divide-y divide-border/70 text-sm">
          <thead
            className={`text-left text-[11px] uppercase tracking-wide text-muted-foreground ${
              focusMode ? "sticky top-0 z-10 bg-background" : ""
            }`}
          >
            <tr>
              <th className="px-3 py-2.5">Payeur</th>
              <th className="px-3 py-2.5">Inscriptions</th>
              <th className="px-3 py-2.5">Reste</th>
              <th className="px-3 py-2.5">Statut</th>
              <th className="px-3 py-2.5 text-right">Traitement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card text-muted-foreground">
            {filteredPayments.map((group, index) => (
              <tr
                key={group.groupKey}
                className={`transition-colors hover:bg-muted/30 dark:hover:bg-muted/10 ${
                  focusMode && index === focusedIndex ? "bg-muted/40 dark:bg-muted/20" : ""
                }`}
              >
                <td className="px-3 py-2.5 align-top font-medium text-foreground">
                  <button
                    type="button"
                    className="text-left underline decoration-dotted underline-offset-2 hover:text-foreground/80 dark:hover:text-foreground/90"
                    onClick={() => setSelectedGroupKey(group.groupKey)}
                  >
                    {group.payerName}
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {group.payerEmail || group.payerPhone
                      ? [group.payerEmail, group.payerPhone].filter(Boolean).join(" / ")
                      : "Contact manquant"}
                  </p>
                </td>
                <td className="px-3 py-2.5 align-top">
                  {group.registrations > 1 ? (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer rounded font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {group.registrations} joueurs
                      </summary>
                      <ul className="mt-2 list-disc space-y-1.5 pl-4">
                        {group.playerDetails.map((player) => (
                          <li key={player.registrationId}>{player.name}</li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <p className="text-xs text-muted-foreground">{group.players.join(", ")}</p>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top font-semibold text-foreground">{formatEuro(group.remainingCents)}</td>
                <td className="px-3 py-2.5 align-top">
                  <span
                    className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      group.paymentStatus === "PAYÉ"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                        : group.paymentStatus === "PARTIEL"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                    }`}
                  >
                    {group.statusLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right align-top">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Ouvrir le dossier de ${group.payerName}`}
                    title="Ouvrir le dossier"
                    onClick={() => setSelectedGroupKey(group.groupKey)}
                  >
                    <FolderOpen aria-hidden="true" className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <>
      {focusMode ? (
        <div className="fixed inset-0 z-40 flex h-full flex-col gap-4 bg-background p-4">
          {content}
        </div>
      ) : (
        content
      )}

      {filteredPayments.length === 0 ? (
        <p className="mt-3 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
          Aucun dossier ne correspond aux filtres actuels.
        </p>
      ) : null}

      {selectedPayment ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <header className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 sm:px-6">
              <div>
                <p className="text-sm text-muted-foreground">Dossier paiement</p>
                <h3 className="text-lg font-semibold text-foreground">{selectedPayment.payerName}</h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm text-muted-foreground transition-colors hover:bg-muted/50 dark:hover:bg-muted/40"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="mx-4 my-3 shrink-0 space-y-2 rounded-lg border border-border bg-secondary/20 p-3 sm:mx-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span
                  className={`rounded-full px-2 py-1 ${
                    selectedPayment.paymentStatus === "PAYÉ"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                      : selectedPayment.paymentStatus === "PARTIEL"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                  }`}
                >
                  Statut : {selectedPayment.statusLabel}
                </span>
                <span className="rounded-full border border-border px-2 py-1 text-foreground">
                  Type : {selectedPayment.dossierType}
                </span>
              </div>

              <div className={`grid gap-2 ${refundedCents > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Montant dû</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatEuro(selectedPayment.totalAmountDueCents)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Déjà payé</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatEuro(selectedPayment.totalPaidCents)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Reste à encaisser</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatEuro(selectedPayment.remainingCents)}
                  </p>
                </div>
                {refundedCents > 0 ? (
                  <div className="rounded-lg border border-border bg-card px-3 py-2">
                    <p className="text-xs text-muted-foreground">Montant remboursé</p>
                    <p className="text-lg font-semibold text-foreground">{formatEuro(refundedCents)}</p>
                  </div>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground">
                Contact : {selectedPayment.payerEmail || "-"} /{" "}
                {selectedPayment.payerPhone || "-"}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
              <section className="space-y-2" aria-labelledby="payment-player-details">
                <h4 id="payment-player-details" className="text-sm font-semibold">
                  Joueurs ({selectedPayment.registrations})
                </h4>
                <ul className="space-y-2">
                  {selectedPayment.playerDetails.map((player) => (
                    <li key={player.registrationId} className="rounded-lg border border-border px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium">
                          {player.name} · {player.tables.length} tableau{player.tables.length === 1 ? "" : "x"} · {formatEuro(player.totalAmountDueCents)}
                        </summary>
                        {player.tables.length > 0 ? (
                          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                            {player.tables.map((table) => (
                              <li key={table.code} className="flex justify-between gap-3">
                                <span>Tableau {table.code} · {table.label}</span>
                                <span className="shrink-0">{formatEuro(table.feeOnlineCents)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">Aucun tableau inscrit</p>
                        )}
                      </details>
                    </li>
                  ))}
                </ul>
              </section>
              {selectedPayment.hasPaymentMismatch &&
              selectedPayment.totalPaidCents > 0 ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                  Montant ajusté manuellement. Vérifie le récapitulatif.
                </div>
              ) : null}

              <details key={selectedPayment.groupKey} className="mt-4 rounded-lg border border-border">
                <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
                  Historique des versements ({selectedPayment.paymentHistory.length})
                </summary>
                {selectedPayment.paymentHistory.length ? (
                  <ul className="divide-y divide-border border-t border-border">
                    {selectedPayment.paymentHistory.map((entry) => (
                      <li key={entry.id} className="flex justify-between gap-3 px-3 py-2 text-sm">
                        <div>
                          <p>{entry.amountCents < 0 ? "Remboursement" : entry.method ? paymentMethodLabels[entry.method] : "Paiement antérieur · moyen inconnu"}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.paidAt ? paymentDateFormatter.format(new Date(entry.paidAt)) : "Date non renseignée"}
                            {entry.recordedBy ? ` · ${entry.recordedBy}` : ""}
                          </p>
                          {entry.reason ? <p className="break-words text-xs">{entry.reason}</p> : null}
                          {entry.reducesDue ? <p className="text-xs text-muted-foreground">Montant dû réduit</p> : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold">{formatEuro(entry.amountCents)}</p>
                          {(entry.refundableCents ?? 0) > 0 ? (
                            <button
                              type="button"
                              disabled={isPending}
                              className="mt-1 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => setRefund({ paymentId: entry.id, operationId: crypto.randomUUID() })}
                            >
                              <Undo2 aria-hidden="true" className="h-3.5 w-3.5" />
                              Rembourser
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border-t border-border px-3 py-2 text-sm text-muted-foreground">
                    Aucun versement enregistré.
                  </p>
                )}
                {refund ? (
                  <form
                    key={refund.operationId}
                    className="space-y-2 border-t border-border p-3 text-sm"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (isPending) return;
                      const form = new FormData(event.currentTarget);
                      const amount = Math.round(Number(form.get("amount")) * 100);
                      const reason = String(form.get("reason") ?? "");
                      startTransition(async () => {
                        try {
                          const result = await recordRefund(
                            selectedPayment.groupKey, refund.paymentId, amount, reason,
                            form.has("reduceDue"), refund.operationId,
                          );
                          setRefund((current) => current?.operationId === refund.operationId
                            ? result.ok ? null : { ...current, error: result.error }
                            : current);
                        } catch {
                          setRefund((current) => current?.operationId === refund.operationId
                            ? { ...current, error: "Impossible de confirmer. Réessayez avec les mêmes informations." }
                            : current);
                        }
                      });
                    }}
                  >
                    <p className="text-xs text-muted-foreground">Enregistrez cette opération une fois l’argent rendu.</p>
                    <label className="grid gap-1">
                      Montant rendu (€)
                      <input name="amount" type="number" min="0.01" step="0.01" required
                        max={(selectedPayment.paymentHistory.find((entry) => entry.id === refund.paymentId)?.refundableCents ?? 0) / 100}
                        className="w-28 rounded border border-border bg-background p-2" />
                    </label>
                    <label className="grid gap-1">
                      Motif
                      <input name="reason" required maxLength={500} className="rounded border border-border bg-background p-2" />
                    </label>
                    <label className="flex items-center gap-2">
                      <input name="reduceDue" type="checkbox" />
                      Réduire aussi le montant dû de cette somme
                    </label>
                    {refund.error ? <p role="alert" className="text-destructive">{refund.error}</p> : null}
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" disabled={isPending} className="rounded bg-primary px-3 py-2 text-primary-foreground">
                        Enregistrer le remboursement
                      </button>
                      <button type="button" disabled={isPending} onClick={() => setRefund(null)}>Annuler</button>
                    </div>
                  </form>
                ) : null}
              </details>

              <label
                className="mt-4 block text-sm font-medium text-foreground"
                htmlFor="payment-note"
              >
                Note interne
              </label>
              <textarea
                id="payment-note"
                className="mt-2 min-h-28 w-full rounded-lg border border-border bg-card p-3 text-sm focus:border-ring focus:outline-none"
                placeholder="Ajouter une note sur le dossier..."
                value={noteValue}
                onChange={(event) => setNoteValue(event.target.value)}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {selectedPayment.noteMismatch ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      Notes différentes détectées dans le dossier.
                    </span>
                  ) : null}
                  {noteValue.trim() !== savedNoteValue.trim() ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      Modifié (non sauvegardé).
                    </span>
                  ) : (
                    <span>Enregistré.</span>
                  )}
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] ${
                      noteValue.trim() !== savedNoteValue.trim()
                        ? "border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {noteValue.trim() !== savedNoteValue.trim()
                      ? "Autosave en attente"
                      : "Autosave OK"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={saveNoteOnly}
                  disabled={isPending}
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 dark:hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Enregistrer la note
                </button>
              </div>

            </div>

            {remainingCents > 0 ? (
              <form
                className="shrink-0 space-y-2 border-t border-border p-4 sm:px-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveManualPaidAmount();
                }}
              >
                <div className="flex flex-wrap items-end gap-2">
                  <label className="grid gap-1 text-xs font-medium">
                    Montant à encaisser (€)
                    <input
                      type="number"
                      min="0.01"
                      max={remainingCents / 100}
                      step="0.01"
                      required
                      value={paymentValue}
                      onChange={(event) => setManualPaidValue(event.target.value)}
                      disabled={isPending}
                      className="w-28 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="grid min-w-36 flex-1 gap-1 text-xs font-medium">
                    Moyen de paiement
                    <select
                      required
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod | "")}
                      disabled={isPending}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Choisir</option>
                      {Object.entries(paymentMethodLabels).map(([method, label]) => (
                        <option key={method} value={method}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={!canRecordPayment || isPending}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {isPending ? "Enregistrement…" : "Encaisser"}
                  </button>
                </div>
                {paymentError ? <p role="alert" className="text-xs text-destructive">{paymentError}</p> : null}
              </form>
            ) : null}
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}




