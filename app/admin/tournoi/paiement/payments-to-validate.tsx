"use client";

import { ChangeEvent, useMemo, useState } from "react";

type PaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";

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

export function PaymentsToValidate({ initialPayments }: Props) {
  const [payments, setPayments] = useState(initialPayments);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [noteByGroup, setNoteByGroup] = useState<Record<string, string>>({});

  const selectedPayment = useMemo(
    () => payments.find((group) => group.groupKey === selectedGroupKey) ?? null,
    [payments, selectedGroupKey],
  );

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

  const validatePayment = () => {
    if (!selectedPayment) {
      return;
    }

    setPayments((current) =>
      current
        .map((group) =>
          group.groupKey === selectedPayment.groupKey
            ? {
                ...group,
                paymentStatus: "PAYÉ",
                statusLabel: "PAYÉ",
                priority: group.priority === "HAUTE" ? "NORMALE" : "HAUTE",
                remainingCents: 0,
                totalPaidCents: group.totalAmountDueCents,
              }
            : group,
        )
        .filter((group) => group.paymentStatus !== "PAYÉ"),
    );
    closeModal();
  };

  return (
    <>
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
            {payments.map((group) => (
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
                      group.paymentStatus === "PARTIEL" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
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
              <button
                type="button"
                onClick={validatePayment}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Valider le paiement
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
