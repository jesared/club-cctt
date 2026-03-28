import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import PaiementsClient from "./paiements-client";

export default async function UserPaiementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const registrations = await prisma.tournamentRegistration.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { player: { ownerId: session.user.id } },
      ],
    },
    select: {
      id: true,
      paidAmountCents: true,
      createdAt: true,
      tournament: { select: { name: true, startDate: true } },
      player: { select: { prenom: true, nom: true } },
      registrationEvents: {
        select: { event: { select: { feeOnlineCents: true, code: true } } },
      },
      payments: {
        select: { amountCents: true, status: true, paidAt: true, method: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const rows = registrations.map((registration) => {
    const totalDueCents = registration.registrationEvents.reduce(
      (acc, entry) => acc + entry.event.feeOnlineCents,
      0,
    );
    const paymentsPaidCents = registration.payments
      .filter((payment) => payment.status === "PAID")
      .reduce((acc, payment) => acc + payment.amountCents, 0);
    const effectivePaidCents =
      registration.payments.length > 0
        ? paymentsPaidCents
        : registration.paidAmountCents;

    let statusLabel = "En attente";
    if (effectivePaidCents >= totalDueCents && totalDueCents > 0) {
      statusLabel = "Payé";
    } else if (effectivePaidCents > 0) {
      statusLabel = "Partiel";
    }

    return {
      id: registration.id,
      tournamentName: registration.tournament.name,
      playerName: `${registration.player.prenom} ${registration.player.nom}`.trim(),
      statusLabel,
      totalDueCents,
      paidCents: effectivePaidCents,
      remainingCents: Math.max(totalDueCents - effectivePaidCents, 0),
      payments: registration.payments,
      tables: registration.registrationEvents.map((event) => event.event.code),
    };
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes paiements</h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez vos dossiers et l&apos;état des règlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/user/inscriptions">Voir mes inscriptions</Link>
          </Button>
        </div>
      </header>

      <PaiementsClient rows={rows} />
    </main>
  );
}
