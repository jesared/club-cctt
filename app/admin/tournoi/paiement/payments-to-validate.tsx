"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import {
  updatePaymentGroupNote,
  updatePaymentGroupPaidAmount,
  updatePaymentGroupStatus,
} from "./actions";

type PaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";
type FilterStatus = "TOUS" | Exclude<PaymentStatus, "PAYÉ">;

type PaymentDossier = {
  groupKey: string;
  payerName: string;
  payerEmail: string | null;
  payerPhone: string | null;
  payerLabel: string;
  registrations: number;
  players: string[];
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
};

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)} EUR`;
}

function formatPaymentStatus(status: PaymentStatus) {
  if (status === "PARTIEL") {
    return "À RÉGULARISER";
  }

  return status;
}

function getSuggestedAction(status: PaymentStatus) {
  if (status === "PAYÉ") {
    return "Aucune action";
  }

  if (status === "PARTIEL") {
    return "Refuser le partiel et demander le règlement complet du solde";
  }

  return "Contrôler le paiement en ligne puis marquer le dossier comme réglé";
}

export function PaymentsToValidate({ initialPayments }: Props) {
  const [payments, setPayments] = useState(initialPayments);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [noteByGroup, setNoteByGroup] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("TOUS");
  const [nameFilter, setNameFilter] = useState("");
  const [showPaidPayments, setShowPaidPayments] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const nameFilterRef = useRef<HTMLInputElement | null>(null);
  const [manualPaidValue, setManualPaidValue] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [savedNoteValue, setSavedNoteValue] = useState("");

  const selectedPayment = useMemo(
    () => payments.find((group) => group.groupKey === selectedGroupKey) ?? null,
    [payments, selectedGroupKey],
  );

  const filteredPayments = useMemo(() => {
    const normalizedNameFilter = nameFilter.trim().toLowerCase();

    return payments.filter((group) => {
      if (!showPaidPayments && group.paymentStatus === "PAYÉ") {
        return false;
      }

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
  }, [payments, statusFilter, nameFilter, showPaidPayments]);

  const relancePayments = useMemo(
    () => payments.filter((group) => group.paymentStatus !== "PAYÉ"),
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
    if (!selectedPayment) return;
    setManualPaidValue("");
    const existingNote = selectedPayment.note ?? noteByGroup[selectedPayment.groupKey] ?? "";
    setNoteValue(existingNote);
    setSavedNoteValue(existingNote);
  }, [selectedPayment]);

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

  const updatePaymentStatus = (nextStatus: PaymentStatus) => {
    if (!selectedPayment || isPending) {
      return;
    }

    const targetGroupKey = selectedPayment.groupKey;
    const targetPayerLabel = selectedPayment.payerLabel;

    startTransition(async () => {
      const result = await updatePaymentGroupStatus(targetGroupKey, nextStatus);

      if (!result.ok) {
        setToastMessage(result.error ?? "La mise à jour du paiement a échoué.");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      setPayments((current) =>
        current.map<PaymentDossier>((group): PaymentDossier => {
          if (group.groupKey !== targetGroupKey) {
            return group;
          }

          return {
            ...group,
            paymentStatus: nextStatus,
            statusLabel: formatPaymentStatus(nextStatus),
            remainingCents:
              nextStatus === "PAYÉ"
                ? 0
                : nextStatus === "PARTIEL"
                  ? Math.max(group.totalAmountDueCents - Math.max(group.totalPaidCents, Math.floor(group.totalAmountDueCents / 2)), 0)
                  : group.totalAmountDueCents,
            totalPaidCents:
              nextStatus === "PAYÉ"
                ? group.totalAmountDueCents
                : nextStatus === "PARTIEL"
                  ? Math.max(group.totalPaidCents, Math.floor(group.totalAmountDueCents / 2))
                  : 0,
            suggestedAction: getSuggestedAction(nextStatus),
          };
        }),
      );

      if (nextStatus === "PAYÉ") {
        setToastMessage(`Paiement validé pour ${targetPayerLabel}.`);
      } else if (nextStatus === "PARTIEL") {
        setToastMessage(`Le dossier de ${targetPayerLabel} est marqué à régulariser.`);
      } else {
        setToastMessage(`Le dossier de ${targetPayerLabel} a été remis en attente.`);
      }

      setTimeout(() => setToastMessage(null), 3000);
      closeModal();
    });
  };

  const validatePayment = () => updatePaymentStatus("PAYÉ");

  const resetPaymentToPending = () => updatePaymentStatus("EN ATTENTE");

  const markPaymentAsPartial = () => updatePaymentStatus("PARTIEL");

  const saveNoteOnly = () => {
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

      setNoteByGroup((current) => ({ ...current, [targetGroupKey]: note }));
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

      setToastMessage("Note enregistree.");
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  useEffect(() => {
    if (!selectedPayment) return;
    if (noteValue.trim() === savedNoteValue.trim()) return;
    if (isPending) return;

    const timeout = setTimeout(() => {
      saveNoteOnly();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [noteValue, savedNoteValue, selectedPayment, isPending]);

  const saveManualPaidAmount = () => {
    if (!selectedPayment || isPending) return;

    const numericValue = Number.parseFloat(manualPaidValue.replace(",", "."));
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setToastMessage("Montant invalide.");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const amountCents = Math.round(numericValue * 100);
    const targetGroupKey = selectedPayment.groupKey;
    const nextPaidCents = Math.min(
      selectedPayment.totalPaidCents + amountCents,
      selectedPayment.totalAmountDueCents,
    );

    startTransition(async () => {
      const result = await updatePaymentGroupPaidAmount(targetGroupKey, nextPaidCents);

      if (!result.ok) {
        setToastMessage(result.error ?? "Mise à jour impossible.");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      setPayments((current) =>
        current.map<PaymentDossier>((group): PaymentDossier => {
          if (group.groupKey !== targetGroupKey) {
            return group;
          }

          const nextPaidCents = result.paidAmountCents ?? nextPaidCents;
          const nextStatus: PaymentStatus =
            nextPaidCents >= group.totalAmountDueCents && group.totalAmountDueCents > 0
              ? "PAYÉ"
              : nextPaidCents > 0
                ? "PARTIEL"
                : "EN ATTENTE";

          return {
            ...group,
            totalPaidCents: nextPaidCents,
            remainingCents: Math.max(group.totalAmountDueCents - nextPaidCents, 0),
            paymentStatus: nextStatus,
            statusLabel: formatPaymentStatus(nextStatus),
            suggestedAction: getSuggestedAction(nextStatus),
            hasPaymentMismatch: true,
          };
        }),
      );

      setToastMessage("Montant encaisse mis a jour.");
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  const manualPaidCents =
    selectedPayment && manualPaidValue.trim()
      ? Math.max(0, Math.round(Number.parseFloat(manualPaidValue.replace(",", ".")) * 100))
      : null;
  const manualMaxCents = selectedPayment?.remainingCents ?? 0;
  const manualRemainingCents =
    selectedPayment && manualPaidCents !== null
      ? Math.max(manualMaxCents - manualPaidCents, 0)
      : null;
  const canShowValidate =
    !selectedPayment ||
    manualPaidValue.trim() === "" ||
    (manualPaidCents !== null && manualPaidCents >= manualMaxCents);

  const exportRelanceCsv = () => {
    if (relancePayments.length === 0) {
      setToastMessage("Aucun dossier a relancer.");
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
      formatEuro(group.remainingCents),
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
        className={`flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-end md:justify-between ${
          focusMode ? "" : "mt-4"
        }`}
      >
        <label className="flex-1 text-sm font-medium text-foreground" htmlFor="payment-status-filter">
          Filtrer par statut
          <select
            id="payment-status-filter"
            className="mt-2 w-full rounded-lg border border-border bg-card p-2.5 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
          >
            <option value="TOUS">Tous</option>
            <option value="EN ATTENTE">En attente</option>
            <option value="PARTIEL">À régulariser</option>
          </select>
        </label>

        <label className="flex-1 text-sm font-medium text-foreground" htmlFor="payment-name-filter">
          Filtrer par nom du payeur
          <input
            id="payment-name-filter"
            type="search"
            ref={nameFilterRef}
            className="mt-2 w-full rounded-lg border border-border bg-card p-2.5 text-sm"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Ex: Martin"
          />
        </label>

        <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showPaidPayments}
            onChange={(event) => setShowPaidPayments(event.target.checked)}
          />
          Afficher les paiements validés
        </label>

        <button
          type="button"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 dark:hover:bg-muted/40"
          onClick={exportRelanceCsv}
        >
          Export relance ({relancePayments.length})
        </button>

        <button
          type="button"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 dark:hover:bg-muted/40"
          onClick={() => setFocusMode((current) => !current)}
        >
          {focusMode ? "Quitter mode caisse" : "Mode caisse"}
        </button>

        {focusMode ? (
          <div className="ml-auto text-xs text-muted-foreground md:text-[11px]">
            ↑/↓ naviguer · Entree ouvrir · Esc fermer
          </div>
        ) : null}
      </div>

      <div className={`overflow-x-auto rounded-lg border border-border ${focusMode ? "flex-1" : "mt-4"}`}>
        <table className="min-w-full divide-y divide-border/70 text-sm">
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
                  <p className="font-medium text-foreground">{group.registrations}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{group.players.join(", ")}</p>
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
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 dark:hover:bg-muted/40"
                    onClick={() => setSelectedGroupKey(group.groupKey)}
                  >
                    Ouvrir
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
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
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
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-muted-foreground">Reste a encaisser</p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatEuro(selectedPayment.remainingCents)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
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
                <span className="rounded-full border border-border px-2 py-1 text-foreground">
                  Deja paye : {formatEuro(selectedPayment.totalPaidCents)}
                </span>
                <span className="rounded-full border border-border px-2 py-1 text-foreground">
                  Montant du : {formatEuro(selectedPayment.totalAmountDueCents)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Contact : {selectedPayment.payerEmail || "-"} / {selectedPayment.payerPhone || "-"}
              </p>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Joueurs : {selectedPayment.players.join(", ")}
            </p>
            {selectedPayment.hasPaymentMismatch ? (
              <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                Incoherence detectee entre le montant saisi et les paiements enregistrés.
              </p>
            ) : null}

            <div className="mt-4 grid gap-2 rounded-lg border border-border bg-card p-3 text-sm">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="paid-amount">
                Montant a encaisser (EUR)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="paid-amount"
                  type="number"
                  min={0}
                  step={1}
                  max={selectedPayment.remainingCents / 100}
                  className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={manualPaidValue}
                  onChange={(event) => setManualPaidValue(event.target.value)}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={saveManualPaidAmount}
                  disabled={isPending}
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60 dark:hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Enregistrer montant
                </button>
                <span className="text-xs text-muted-foreground">
                  Max : {formatEuro(selectedPayment.remainingCents)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Reste :{" "}
                  {manualRemainingCents !== null
                    ? formatEuro(manualRemainingCents)
                    : formatEuro(selectedPayment.remainingCents)}
                </span>
              </div>
            </div>

            <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="payment-note">
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
                    Notes differentes detectees dans le dossier.
                  </span>
                ) : null}
                {noteValue.trim() !== savedNoteValue.trim() ? (
                  <span className="text-amber-700 dark:text-amber-300">
                    Modifie (non sauvegarde).
                  </span>
                ) : (
                  <span>Enregistre.</span>
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

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 dark:hover:bg-muted/40">
                Annuler
              </button>
              {canShowValidate ? (
                <button
                  type="button"
                  onClick={validatePayment}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_0_2px_rgba(59,130,246,0.25)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={selectedPayment.paymentStatus === "PAYÉ" || isPending}
                >
                  {isPending ? "Mise à jour..." : "Valider le paiement"}
                </button>
              ) : null}
              {selectedPayment.paymentStatus !== "PARTIEL" ? (
                <button
                  type="button"
                  onClick={markPaymentAsPartial}
                  disabled={isPending}
                  className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/50 dark:hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Marquer partiel
                </button>
              ) : null}
              {selectedPayment.paymentStatus === "PARTIEL" ? (
                <button
                  type="button"
                  onClick={resetPaymentToPending}
                  disabled={isPending}
                  className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/50 dark:hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Repasser en attente
                </button>
              ) : null}
            </div>
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




