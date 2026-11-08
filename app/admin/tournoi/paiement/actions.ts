"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../_components";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { getEffectivePaidCents, getRegistrationTotalDueCents, isRecordedRefund, REFUND_PROVIDER, REFUND_WITH_CREDIT_PROVIDER } from "../payment-utils";
import { CASH_DESK_PROVIDER, getPaymentHistoryKey, LEGACY_BALANCE_PROVIDER, readPaymentMetadata } from "./payment-history";
import { getPaymentGroupKey } from "../payment-grouping";

export async function recordPayment(
  groupKey: string,
  amountCents: number,
  method: PaymentMethod,
  operationId: string,
) {
  const { user } = await requireAdminSession();
  const tournamentId = groupKey.split(":")[1];

  if (
    !tournamentId ||
    !Number.isSafeInteger(amountCents) ||
    amountCents <= 0 ||
    !Object.values(PaymentMethod).includes(method) ||
    !/^[0-9a-f-]{36}$/i.test(operationId)
  ) {
    return { ok: false, error: "Vérifiez le montant et le moyen de paiement." } as const;
  }

  const providerRef = JSON.stringify({ operationId, recordedBy: user.name || user.email });
  const paidAt = new Date();
  const result = await withPrismaRetry(() =>
    prisma.$transaction(async (tx) => {
      const registrations = (await tx.tournamentRegistration.findMany({
        where: { tournamentId },
        orderBy: { id: "asc" },
        include: {
          player: { select: { ownerId: true, owner: { select: { name: true, email: true } } } },
          registrationEvents: { select: { event: { select: { feeOnlineCents: true } } } },
          payments: true,
        },
      })).filter((registration) => getPaymentGroupKey(registration) === groupKey);

      if (registrations.length === 0) {
        return { ok: false, error: "Le dossier sélectionné n’existe plus." } as const;
      }

      const dueCents = registrations.reduce(
        (total, registration) => total + getRegistrationTotalDueCents(registration.registrationEvents, registration.payments),
        0,
      );
      const paidCents = registrations.reduce(
        (total, registration) => total + getEffectivePaidCents(registration),
        0,
      );
      const alreadyRecorded = registrations.some(({ payments }) =>
        payments.some((payment) => payment.provider === CASH_DESK_PROVIDER && payment.providerRef === providerRef),
      );

      if (!alreadyRecorded && amountCents > dueCents - paidCents) {
        return { ok: false, error: "Le solde a changé. Vérifiez le montant avant de réessayer." } as const;
      }

      if (!alreadyRecorded) {
        let toAllocate = amountCents;
        for (const registration of registrations) {
          if (toAllocate === 0) break;

          const alreadyPaid = getEffectivePaidCents(registration);
          const due = getRegistrationTotalDueCents(registration.registrationEvents, registration.payments);
          const allocated = Math.min(toAllocate, Math.max(due - alreadyPaid, 0));
          if (allocated === 0) continue;

          const entries: Prisma.TournamentPaymentCreateWithoutRegistrationInput[] = [];
          if (registration.payments.length === 0 && alreadyPaid > 0) {
            entries.push({
              amountCents: alreadyPaid,
              method,
              status: PaymentStatus.PAID,
              provider: LEGACY_BALANCE_PROVIDER,
              providerRef: `legacy:${registration.id}`,
            });
          }
          entries.push({
            amountCents: allocated,
            method,
            status: PaymentStatus.PAID,
            paidAt,
            provider: CASH_DESK_PROVIDER,
            providerRef,
          });
          await tx.tournamentRegistration.update({
            where: { id: registration.id },
            data: {
              paidAmountCents: alreadyPaid + allocated,
              payments: { create: entries },
            },
          });
          toAllocate -= allocated;
        }
      }

      return { ok: true } as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
  );

  revalidatePath("/admin/tournoi/paiement");
  revalidatePath("/admin/tournoi/joueurs");
  revalidatePath("/admin/tournoi/inscriptions");
  return result;
}

export async function recordRefund(
  groupKey: string,
  paymentId: string,
  amountCents: number,
  reason: string,
  reduceDue: boolean,
  operationId: string,
) {
  const { user } = await requireAdminSession();
  const tournamentId = groupKey.split(":")[1];
  const trimmedReason = reason.trim();
  if (!tournamentId || !paymentId || !Number.isSafeInteger(amountCents) || amountCents <= 0 ||
      !trimmedReason || trimmedReason.length > 500 || !/^[0-9a-f-]{36}$/i.test(operationId)) {
    return { ok: false, error: "Vérifiez le montant et le motif du remboursement." } as const;
  }

  const result = await withPrismaRetry(() =>
    prisma.$transaction(async (tx) => {
      const registrations = (await tx.tournamentRegistration.findMany({
        where: { tournamentId },
        orderBy: { id: "asc" },
        include: {
          player: { select: { ownerId: true, owner: { select: { name: true, email: true } } } },
          registrationEvents: { select: { event: { select: { feeOnlineCents: true } } } },
          payments: true,
        },
      })).filter((registration) => getPaymentGroupKey(registration) === groupKey);
      const payments = registrations.flatMap((registration) => registration.payments);
      if (payments.some((payment) =>
        isRecordedRefund(payment) && readPaymentMetadata(payment.providerRef).operationId === operationId,
      )) return { ok: true } as const;

      const original = payments.find((payment) => payment.status === "PAID" &&
        (payment.id === paymentId || getPaymentHistoryKey(payment) === paymentId));
      const refundOf = original ? getPaymentHistoryKey(original) : paymentId;
      const providerRef = JSON.stringify({
        operationId, refundOf, reason: trimmedReason, recordedBy: user.name || user.email,
      });
      const provider = reduceDue ? REFUND_WITH_CREDIT_PROVIDER : REFUND_PROVIDER;
      const paidAt = new Date();
      let remaining = amountCents;
      const allocations = [];

      for (const registration of registrations) {
        const legacy = refundOf === `legacy:${registration.id}` && registration.payments.length === 0;
        const paid = getEffectivePaidCents(registration);
        const originalCents = legacy ? paid : registration.payments.reduce((sum, payment) =>
          payment.status === "PAID" && getPaymentHistoryKey(payment) === refundOf
            ? sum + payment.amountCents : sum, 0);
        const refunded = registration.payments.reduce((sum, payment) =>
          isRecordedRefund(payment) && readPaymentMetadata(payment.providerRef).refundOf === refundOf
            ? sum + payment.amountCents : sum, 0);
        const due = getRegistrationTotalDueCents(registration.registrationEvents, registration.payments);
        const allocated = Math.min(remaining, originalCents - refunded, paid, reduceDue ? due : remaining);
        if (allocated <= 0) continue;
        allocations.push({ registration, legacy, paid, allocated });
        remaining -= allocated;
        if (remaining === 0) break;
      }

      if (remaining > 0) {
        return { ok: false, error: "Le montant dépasse le solde remboursable de ce versement ou la réduction possible du montant dû." } as const;
      }

      for (const { registration, legacy, paid, allocated } of allocations) {
        const method = original?.method ?? PaymentMethod.CASH;
        const entries: Prisma.TournamentPaymentCreateWithoutRegistrationInput[] = [];
        if (legacy) {
          entries.push({
            amountCents: paid, method, status: PaymentStatus.PAID,
            provider: LEGACY_BALANCE_PROVIDER, providerRef: refundOf,
          });
        }
        entries.push({
          amountCents: allocated, method, status: PaymentStatus.REFUNDED,
          provider, providerRef, paidAt,
        });
        await tx.tournamentRegistration.update({
          where: { id: registration.id },
          data: { paidAmountCents: paid - allocated, payments: { create: entries } },
        });
      }
      return { ok: true } as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
  );

  revalidatePath("/admin/tournoi/paiement");
  revalidatePath("/admin/tournoi/joueurs");
  revalidatePath("/admin/tournoi/inscriptions");
  revalidatePath("/admin/tournoi/pointages");
  revalidatePath("/user");
  revalidatePath("/user/paiements");
  revalidatePath("/user/inscriptions");
  return result;
}

export async function updatePaymentGroupNote(groupKey: string, note: string) {
  await requireAdminSession();

  if (!groupKey) {
    return { ok: false, error: "Dossier de paiement introuvable." };
  }

  const normalizedNote = note.trim();

  const registrations = await prisma.tournamentRegistration.findMany({
    select: {
      id: true,
      tournamentId: true,
      contactEmail: true,
      contactPhone: true,
      player: {
        select: {
          ownerId: true,
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const targetRegistrations = registrations.filter(
    (registration) => getPaymentGroupKey(registration) === groupKey,
  );

  if (targetRegistrations.length === 0) {
    return { ok: false, error: "Le dossier sélectionné n'existe plus." };
  }

  await prisma.$transaction(
    targetRegistrations.map((registration) =>
      prisma.tournamentRegistration.update({
        where: { id: registration.id },
        data: { notes: normalizedNote },
      }),
    ),
  );

  revalidatePath("/admin/tournoi/paiement");
  revalidatePath("/admin/tournoi/joueurs");
  revalidatePath("/admin/tournoi/inscriptions");

  return { ok: true };
}


