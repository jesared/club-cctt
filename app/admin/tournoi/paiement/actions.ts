"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../_components";
import { getPaymentGroupKey } from "../payment-grouping";

type UiPaymentStatus = "PAYÉ" | "PARTIEL" | "EN ATTENTE";

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

  const targetRegistrations = registrations.filter(
    (registration) => getPaymentGroupKey(registration) === groupKey,
  );

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

      const paidAmountCents = nextPayments
        .filter((payment) => payment.status === PaymentStatus.PAID)
        .reduce((acc, payment) => acc + payment.amountCents, 0);

      return prisma.tournamentRegistration.update({
        where: { id: registration.id },
        data: {
          paidAmountCents,
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

export async function updatePaymentGroupPaidAmount(groupKey: string, paidAmountCents: number) {
  await requireAdminSession();

  if (!groupKey) {
    return { ok: false, error: "Dossier de paiement introuvable." };
  }

  const normalizedPaidAmount = Number.isFinite(paidAmountCents) ? Math.max(paidAmountCents, 0) : 0;

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

  const targetRegistrations = registrations.filter(
    (registration) => getPaymentGroupKey(registration) === groupKey,
  );

  if (targetRegistrations.length === 0) {
    return { ok: false, error: "Le dossier sélectionné n'existe plus." };
  }

  const registrationsWithDue = targetRegistrations.map((registration) => {
    const totalAmountDueCents = registration.registrationEvents.reduce(
      (acc, eventEntry) => acc + eventEntry.event.feeOnlineCents,
      0,
    );
    return { ...registration, totalAmountDueCents };
  });

  const totalDue = registrationsWithDue.reduce((sum, reg) => sum + reg.totalAmountDueCents, 0);
  const cappedPaidAmount = Math.min(normalizedPaidAmount, totalDue);

  let remainingToAllocate = cappedPaidAmount;
  const allocations = registrationsWithDue.map((registration) => {
    const allocation = Math.min(registration.totalAmountDueCents, remainingToAllocate);
    remainingToAllocate -= allocation;
    return {
      id: registration.id,
      paidAmountCents: allocation,
      totalAmountDueCents: registration.totalAmountDueCents,
    };
  });

  await prisma.$transaction(
    allocations.map((allocation) => {
      const pendingCents = Math.max(
        allocation.totalAmountDueCents - allocation.paidAmountCents,
        0,
      );

      return prisma.tournamentRegistration.update({
        where: { id: allocation.id },
        data: {
          paidAmountCents: allocation.paidAmountCents,
          payments: {
            deleteMany: {},
            create: [
              ...(allocation.paidAmountCents > 0
                ? [
                    {
                      amountCents: allocation.paidAmountCents,
                      status: PaymentStatus.PAID,
                      method: PaymentMethod.CASH,
                      provider: "ADMIN_PANEL",
                      paidAt: new Date(),
                    },
                  ]
                : []),
              ...(pendingCents > 0
                ? [
                    {
                      amountCents: pendingCents,
                      status: PaymentStatus.PENDING,
                      method: PaymentMethod.CASH,
                      provider: "ADMIN_PANEL",
                      paidAt: null,
                    },
                  ]
                : []),
            ],
          },
        },
      });
    }),
  );

  revalidatePath("/admin/tournoi/paiement");
  revalidatePath("/admin/tournoi/joueurs");
  revalidatePath("/admin/tournoi/inscriptions");

  return { ok: true, paidAmountCents: cappedPaidAmount };
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


