import { describe, expect, it } from "vitest";
import { CANCELLED_REFUND_PROVIDER } from "../app/admin/tournoi/payment-utils";
import {
  addPaymentToHistory,
  CASH_DESK_PROVIDER,
  LEGACY_BALANCE_PROVIDER,
  type PaymentHistoryEntry,
} from "../app/admin/tournoi/paiement/payment-history";

describe("tournament payment history", () => {
  it("shows one entry for a payment split across players", () => {
    const history = new Map<string, PaymentHistoryEntry>();
    const payment = {
      method: "CARD" as const,
      status: "PAID" as const,
      provider: CASH_DESK_PROVIDER,
      providerRef: JSON.stringify({ operationId: "payment-1", recordedBy: "Caisse" }),
      paidAt: new Date("2027-03-27T13:00:00Z"),
    };

    addPaymentToHistory(history, { ...payment, id: "first", amountCents: 900 });
    addPaymentToHistory(history, { ...payment, id: "second", amountCents: 300 });

    expect([...history.values()]).toEqual([
      {
        id: "first",
        amountCents: 1200,
        method: "CARD",
        paidAt: "2027-03-27T13:00:00.000Z",
        recordedBy: "Caisse",
      },
    ]);
  });

  it("keeps the method and date unknown for a carried-over balance", () => {
    const history = new Map<string, PaymentHistoryEntry>();
    addPaymentToHistory(history, {
      id: "previous",
      amountCents: 2600,
      method: "CARD",
      status: "PAID",
      provider: LEGACY_BALANCE_PROVIDER,
      providerRef: null,
      paidAt: null,
    });

    expect(history.get("previous")).toMatchObject({
      amountCents: 2600,
      method: null,
      paidAt: null,
      recordedBy: null,
    });
  });

  it("regroupe les lignes d’un remboursement annulé et conserve sa trace", () => {
    const history = new Map<string, PaymentHistoryEntry>();
    const cancelledAt = "2027-03-27T14:00:00.000Z";
    const refund = {
      method: "CARD" as const,
      status: "REFUNDED" as const,
      provider: CANCELLED_REFUND_PROVIDER,
      providerRef: JSON.stringify({
        operationId: "refund-1",
        refundOf: "payment-1",
        reason: "Erreur de saisie",
        reducesDue: true,
        cancelledAt,
        cancelledBy: "Caisse",
      }),
      paidAt: new Date("2027-03-27T13:00:00Z"),
    };

    addPaymentToHistory(history, { ...refund, id: "first", amountCents: 900 });
    addPaymentToHistory(history, { ...refund, id: "second", amountCents: 300 });

    expect([...history.values()]).toMatchObject([{
      id: "first",
      amountCents: -1200,
      reason: "Erreur de saisie",
      reducesDue: true,
      refundOf: "payment-1",
      cancelled: true,
      cancelledAt,
      cancelledBy: "Caisse",
    }]);
  });
});
