export type RegistrationPaymentEntry = {
  amountCents: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
};

export type RegistrationEventFeeEntry = {
  event: {
    feeOnlineCents: number;
  };
};

export type PaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";

export function getRegistrationTotalDueCents(
  registrationEvents: RegistrationEventFeeEntry[],
) {
  return registrationEvents.reduce(
    (sum, entry) => sum + entry.event.feeOnlineCents,
    0,
  );
}

export function getRecordedPaidCents(payments: RegistrationPaymentEntry[]) {
  return payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
}

export function getEffectivePaidCents({
  paidAmountCents,
  payments,
}: {
  paidAmountCents: number;
  payments: RegistrationPaymentEntry[];
}) {
  return payments.length > 0 ? getRecordedPaidCents(payments) : paidAmountCents;
}

export function getPaymentStatusFromAmounts(
  totalDueCents: number,
  totalPaidCents: number,
): PaymentStatus {
  if (totalDueCents <= 0 || totalPaidCents >= totalDueCents) {
    return "PAYÉ";
  }

  if (totalPaidCents > 0) {
    return "PARTIEL";
  }

  return "EN ATTENTE";
}
