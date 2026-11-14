import type { PaymentMethod } from "@prisma/client";
import { isCancelledRefund, isRecordedRefund, REFUND_WITH_CREDIT_PROVIDER, type RegistrationPaymentEntry } from "../payment-utils";

export const CASH_DESK_PROVIDER = "CCTT_CASH_DESK";
export const LEGACY_BALANCE_PROVIDER = "CCTT_LEGACY_BALANCE";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  CARD: "Carte",
  TRANSFER: "Virement",
  ONLINE: "Paiement en ligne",
};

export type PaymentHistoryEntry = {
  id: string;
  amountCents: number;
  method: PaymentMethod | null;
  paidAt: string | null;
  recordedBy: string | null;
  refundOf?: string;
  reason?: string;
  reducesDue?: boolean;
  refundableCents?: number;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelled?: boolean;
};

export function getPaymentHistoryKey(payment: {
  id: string;
  provider: string | null;
  providerRef: string | null;
}) {
  return payment.provider === CASH_DESK_PROVIDER || payment.provider === LEGACY_BALANCE_PROVIDER
    ? payment.providerRef ?? payment.id
    : payment.id;
}

export function readPaymentMetadata(reference: string | null) {
  try {
    const metadata = JSON.parse(reference ?? "null");
    return {
      recordedBy: typeof metadata?.recordedBy === "string" ? String(metadata.recordedBy) : null,
      operationId: typeof metadata?.operationId === "string" ? String(metadata.operationId) : undefined,
      refundOf: typeof metadata?.refundOf === "string" ? String(metadata.refundOf) : undefined,
      reason: typeof metadata?.reason === "string" ? String(metadata.reason) : undefined,
      reducesDue: metadata?.reducesDue === true,
      cancelledAt: typeof metadata?.cancelledAt === "string" ? String(metadata.cancelledAt) : undefined,
      cancelledBy: typeof metadata?.cancelledBy === "string" ? String(metadata.cancelledBy) : undefined,
    };
  } catch {
    return { recordedBy: null };
  }
}

export function addPaymentToHistory(
  history: Map<string, PaymentHistoryEntry>,
  payment: RegistrationPaymentEntry & {
    id: string;
    amountCents: number;
    method: PaymentMethod;
    provider: string | null;
    providerRef: string | null;
    paidAt: Date | null;
  },
) {
  const cancelled = isCancelledRefund(payment);
  const refund = cancelled || isRecordedRefund(payment);
  const id = refund ? payment.providerRef ?? payment.id : getPaymentHistoryKey(payment);
  const amountCents = refund ? -payment.amountCents : payment.amountCents;
  const existing = history.get(id);
  if (existing) {
    existing.amountCents += amountCents;
    return;
  }

  const metadata = readPaymentMetadata(payment.providerRef);

  history.set(id, {
    id: payment.id,
    amountCents,
    method: payment.provider === LEGACY_BALANCE_PROVIDER || payment.provider === "ADMIN_PANEL"
      ? null
      : payment.method,
    paidAt: payment.paidAt?.toISOString() ?? null,
    recordedBy: metadata.recordedBy,
    ...(refund ? {
      refundOf: metadata.refundOf,
      reason: metadata.reason,
      reducesDue: payment.provider === REFUND_WITH_CREDIT_PROVIDER || metadata.reducesDue === true,
    } : {}),
    ...(cancelled ? {
      cancelled: true,
      cancelledAt: metadata.cancelledAt,
      cancelledBy: metadata.cancelledBy,
    } : {}),
  });
}
