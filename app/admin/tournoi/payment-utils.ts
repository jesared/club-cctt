export type RegistrationPaymentEntry = {
  amountCents: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  provider?: string | null;
};

export const REFUND_PROVIDER = "CCTT_REFUND";
export const REFUND_WITH_CREDIT_PROVIDER = "CCTT_REFUND_WITH_CREDIT";
export const CANCELLED_REFUND_PROVIDER = "CCTT_CANCELLED_REFUND";

export function isRecordedRefund(payment: RegistrationPaymentEntry) {
  return payment.status === "REFUNDED" &&
    (payment.provider === REFUND_PROVIDER || payment.provider === REFUND_WITH_CREDIT_PROVIDER);
}

export function isCancelledRefund(payment: RegistrationPaymentEntry) {
  return payment.status === "REFUNDED" && payment.provider === CANCELLED_REFUND_PROVIDER;
}

export type RegistrationEventFeeEntry = {
  event: {
    feeOnlineCents: number;
  };
};

export type PaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";

export function isFullyRefunded(dueCents: number, paidCents: number, hasRefund: boolean) {
  return dueCents === 0 && paidCents === 0 && hasRefund;
}

export function getRegistrationTotalDueCents(
  registrationEvents: RegistrationEventFeeEntry[],
  payments: RegistrationPaymentEntry[] = [],
) {
  const fees = registrationEvents.reduce(
    (sum, entry) => sum + entry.event.feeOnlineCents,
    0,
  );
  const credits = payments.reduce((sum, payment) =>
    isRecordedRefund(payment) && payment.provider === REFUND_WITH_CREDIT_PROVIDER
      ? sum + payment.amountCents
      : sum, 0);
  return Math.max(fees - credits, 0);
}

export function getRecordedPaidCents(payments: RegistrationPaymentEntry[]) {
  return payments
    .reduce((sum, payment) => {
      if (payment.status === "PAID") return sum + payment.amountCents;
      return isRecordedRefund(payment) ? sum - payment.amountCents : sum;
    }, 0);
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

export function getRegistrationPaymentDisplay(registration: {
  paidAmountCents: number;
  payments: RegistrationPaymentEntry[];
  registrationEvents: RegistrationEventFeeEntry[];
}) {
  const due = getRegistrationTotalDueCents(registration.registrationEvents, registration.payments);
  const paid = getEffectivePaidCents(registration);
  const status = getPaymentStatusFromAmounts(due, paid);

  return {
    payment: status === "PAYÉ" ? "Payé" : status === "PARTIEL" ? "À régulariser" : "En attente",
    fullyRefunded: isFullyRefunded(due, paid, registration.payments.some(isRecordedRefund)),
  } as const;
}
