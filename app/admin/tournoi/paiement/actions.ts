"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../_components";

type UiPaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";

function normalizeGroupValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().toLowerCase();
}

function getRegistrationGroupKey(registration: { id: string; contactEmail: string | null; contactPhone: string | null }) {
  const normalizedEmail = normalizeGroupValue(registration.contactEmail);
  const normalizedPhone = normalizeGroupValue(registration.contactPhone);

  return normalizedEmail || normalizedPhone || `registration:${registration.id}`;
}

function buildPaymentsForStatus(totalAmountDueCents: number, nextStatus: UiPaymentStatus) {
  if (totalAmountDueCents <= 0) {
    return [];
  }

  if (nextStatus === "PAYÉ") {
    return [{ amountCents: totalAmountDueCents, status: PaymentStatus.PAID }];
  }

  if (nextStatus === "PARTIEL") {
    const paidAmountCents = Math.max(Math.floor(totalAmountDueCents / 2), 1);
    const remainingAmountCents = Math.max(totalAmountDueCents - paidAmountCents, 0);

    return [
      {
        amountCents: paidAmountCents,
        status: PaymentStatus.PAID,
      },
      ...(remainingAmountCents > 0
        ? [
            {
              amountCents: remainingAmountCents,
              status: PaymentStatus.PENDING,
            },
          ]
        : []),
    ];
  }

  return [{ amountCents: totalAmountDueCents, status: PaymentStatus.PENDING }];
}

export async function updatePaymentGroupStatus(groupKey: string, nextStatus: UiPaymentStatus) {
  await requireAdminSession();

  if (!groupKey) {
    return { ok: false, error: "Dossier de paiement introuvable." };
  }

  const registrations = await prisma.tournamentRegistration.findMany({
    select: {
      id: true,
      contactEmail: true,
      contactPhone: true,
      registrationEvents: {
        select: {
          event: {
            select: {
              feeOnlineCents: true,
            },
          },
        },
      },
    },
  });

  const targetRegistrations = registrations.filter((registration) => getRegistrationGroupKey(registration) === groupKey);

  if (targetRegistrations.length === 0) {
    return { ok: false, error: "Le dossier sélectionné n'existe plus." };
  }

  await prisma.$transaction(
    targetRegistrations.map((registration) => {
      const totalAmountDueCents = registration.registrationEvents.reduce(
        (acc, eventEntry) => acc + eventEntry.event.feeOnlineCents,
        0,
      );
      const nextPayments = buildPaymentsForStatus(totalAmountDueCents, nextStatus);

      return prisma.tournamentRegistration.update({
        where: { id: registration.id },
        data: {
          payments: {
            deleteMany: {},
            create: nextPayments.map((payment) => ({
              amountCents: payment.amountCents,
              status: payment.status,
              method: PaymentMethod.CASH,
              provider: "ADMIN_PANEL",
              paidAt: payment.status === PaymentStatus.PAID ? new Date() : null,
            })),
          },
        },
      });
    }),
  );

  revalidatePath("/admin/tournoi/paiement");
  revalidatePath("/admin/tournoi/joueurs");
  revalidatePath("/admin/tournoi/inscriptions");

  return { ok: true };
}
