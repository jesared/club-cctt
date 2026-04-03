import { describe, expect, it } from "vitest";

import {
  getEffectivePaidCents,
  getPaymentStatusFromAmounts,
  getRegistrationTotalDueCents,
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
