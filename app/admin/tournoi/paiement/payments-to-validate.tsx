"use client";

import { ChangeEvent, useMemo, useState, useTransition } from "react";
import { updatePaymentGroupStatus } from "./actions";

type PaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";
type FilterStatus = "TOUS" | Exclude<PaymentStatus, "PAYÉ">;

type PaymentDossier = {
  groupKey: string;
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
};

type Props = {
  initialPayments: PaymentDossier[];
};

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

      return group.payerLabel.toLowerCase().includes(normalizedNameFilter);
    });
  }, [payments, statusFilter, nameFilter, showPaidPayments]);

  const closeModal = () => setSelectedGroupKey(null);

  const updateSelectedPriority = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!selectedPayment) {
      return;
    }

    const nextPriority = event.target.value as PaymentDossier["priority"];

    setPayments((current) =>
      current.map((group) =>
        group.groupKey === selectedPayment.groupKey
          ? {
              ...group,
              priority: nextPriority,
            }
          : group,
      ),
    );
  };

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

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm font-medium text-gray-900" htmlFor="payment-status-filter">
          Filtrer par statut
          <select
            id="payment-status-filter"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
          >
            <option value="TOUS">Tous</option>
            <option value="EN ATTENTE">En attente</option>
            <option value="PARTIEL">À régulariser</option>
          </select>
        </label>

        <label className="flex-1 text-sm font-medium text-gray-900" htmlFor="payment-name-filter">
          Filtrer par nom du payeur
          <input
            id="payment-name-filter"
            type="search"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Ex: Martin"
          />
        </label>

        <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showPaidPayments}
            onChange={(event) => setShowPaidPayments(event.target.checked)}
          />
          Afficher les paiements validés
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Priorité</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Payeur</th>
              <th className="px-4 py-3">Joueurs</th>
              <th className="px-4 py-3">Reste à encaisser</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Action suggérée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
            {filteredPayments.map((group) => (
              <tr key={group.groupKey} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      group.priority === "HAUTE" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {group.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{group.dossierType}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <button
                    type="button"
                    className="underline decoration-dotted underline-offset-2 hover:text-indigo-700"
                    onClick={() => setSelectedGroupKey(group.groupKey)}
                  >
                    {group.payerLabel}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{group.registrations} inscriptions</p>
                  <p className="text-xs text-gray-500">{group.players.join(", ")}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatEuro(group.remainingCents)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      group.paymentStatus === "PAYÉ"
                        ? "bg-emerald-100 text-emerald-700"
                        : group.paymentStatus === "PARTIEL"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {group.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{group.suggestedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 ? (
        <p className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-600">
          Aucun dossier ne correspond aux filtres actuels.
        </p>
      ) : null}

      {selectedPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Traitement du dossier</h3>
                <p className="mt-1 text-sm text-gray-600">{selectedPayment.payerLabel}</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-md border px-2 py-1 text-sm text-gray-600 hover:bg-gray-50">
                Fermer
              </button>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li><span className="font-medium text-gray-900">Type :</span> {selectedPayment.dossierType}</li>
              <li><span className="font-medium text-gray-900">Statut :</span> {selectedPayment.statusLabel}</li>
              <li><span className="font-medium text-gray-900">Montant dû :</span> {formatEuro(selectedPayment.totalAmountDueCents)}</li>
              <li><span className="font-medium text-gray-900">Déjà payé :</span> {formatEuro(selectedPayment.totalPaidCents)}</li>
              <li><span className="font-medium text-gray-900">Reste à encaisser :</span> {formatEuro(selectedPayment.remainingCents)}</li>
              <li><span className="font-medium text-gray-900">Joueurs :</span> {selectedPayment.players.join(", ")}</li>
            </ul>

            <label className="mt-4 block text-sm font-medium text-gray-900" htmlFor="payment-priority">
              Priorité
            </label>
            <select
              id="payment-priority"
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
              value={selectedPayment.priority}
              onChange={updateSelectedPriority}
            >
              <option value="NORMALE">NORMALE</option>
              <option value="HAUTE">HAUTE</option>
            </select>

            <label className="mt-4 block text-sm font-medium text-gray-900" htmlFor="payment-note">
              Note interne
            </label>
            <textarea
              id="payment-note"
              className="mt-2 min-h-28 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Ajouter une note sur le dossier..."
              value={noteByGroup[selectedPayment.groupKey] ?? ""}
              onChange={(event) =>
                setNoteByGroup((current) => ({
                  ...current,
                  [selectedPayment.groupKey]: event.target.value,
                }))
              }
            />

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              {selectedPayment.paymentStatus === "PAYÉ" ? (
                <button
                  type="button"
                  onClick={resetPaymentToPending}
                  disabled={isPending}
                  className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remettre en attente
                </button>
              ) : null}
              {selectedPayment.paymentStatus !== "PARTIEL" ? (
                <button
                  type="button"
                  onClick={markPaymentAsPartial}
                  disabled={isPending}
                  className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Marquer partiel
                </button>
              ) : null}
              <button
                type="button"
                onClick={validatePayment}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                disabled={selectedPayment.paymentStatus === "PAYÉ" || isPending}
              >
                {isPending ? "Mise à jour..." : "Valider le paiement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-4 right-4 z-[60] rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
