import { describe, expect, it } from "vitest";

import {
  getEffectivePaidCents,
  getPaymentStatusFromAmounts,
  getRegistrationTotalDueCents,
  REFUND_PROVIDER,
  REFUND_WITH_CREDIT_PROVIDER,
} from "../app/admin/tournoi/payment-utils";

describe("payment-utils", () => {
  it("calcule le montant dû à partir des engagements", () => {
    expect(
      getRegistrationTotalDueCents([
        { event: { feeOnlineCents: 900 } },
        { event: { feeOnlineCents: 1100 } },
      ]),
    ).toBe(2000);
  });

  it("utilise le montant payé stocké quand aucun paiement détaillé n'existe", () => {
    expect(
      getEffectivePaidCents({
        paidAmountCents: 1800,
        payments: [],
      }),
    ).toBe(1800);
  });

  it("prend en compte uniquement les paiements marqués PAYÉ quand ils existent", () => {
    expect(
      getEffectivePaidCents({
        paidAmountCents: 1800,
        payments: [
          { amountCents: 700, status: "PAID" },
          { amountCents: 300, status: "PENDING" },
          { amountCents: 200, status: "FAILED" },
        ],
      }),
    ).toBe(700);
  });

  it.each([
    { provider: REFUND_PROVIDER, due: 10000, remaining: 2000 },
    { provider: REFUND_WITH_CREDIT_PROVIDER, due: 8000, remaining: 0 },
  ])("calcule le solde après un remboursement $provider", ({ provider, due, remaining }) => {
    const payments = [
      { amountCents: 10000, status: "PAID" as const },
      { amountCents: 2000, status: "REFUNDED" as const, provider },
      { amountCents: 1000, status: "REFUNDED" as const },
    ];
    const amountDue = getRegistrationTotalDueCents([{ event: { feeOnlineCents: 10000 } }], payments);
    const amountPaid = getEffectivePaidCents({ paidAmountCents: 10000, payments });
    expect(amountDue).toBe(due);
    expect(amountPaid).toBe(8000);
    expect(amountDue - amountPaid).toBe(remaining);
  });

  it.each([
    { due: 0, paid: 0, status: "PAYÉ" },
    { due: 2000, paid: 2000, status: "PAYÉ" },
    { due: 2000, paid: 500, status: "PARTIEL" },
    { due: 2000, paid: 0, status: "EN ATTENTE" },
  ])(
    "retourne $status pour due=$due et paid=$paid",
    ({ due, paid, status }) => {
      expect(getPaymentStatusFromAmounts(due, paid)).toBe(status);
    },
  );
});
