import {
  CalendarClock,
  CircleDollarSign,
  ListChecks,
  UserRound,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatAmount(cents: number) {
  return `${(cents / 100).toFixed(2)} €`;
}

function getRegistrationStatusLabel(
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmée";
    case "CANCELLED":
      return "Annulée";
    case "PENDING":
    default:
      return "En attente";
  }
}

function getEventStatusLabel(
  status: "REGISTERED" | "WAITLISTED" | "CHECKED_IN" | "NO_SHOW" | "FORFEIT",
) {
  switch (status) {
    case "WAITLISTED":
      return "Liste d'attente";
    case "CHECKED_IN":
      return "Pointé";
    case "NO_SHOW":
      return "Absent";
    case "FORFEIT":
      return "Forfait";
    case "REGISTERED":
    default:
      return "Inscrit";
  }
}

export default async function MesInscriptionsPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.trim().toLowerCase();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/user/inscriptions");
  }

  const tournament = await prisma.tournament.findFirst({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    orderBy: [{ startDate: "desc" }],
    select: { id: true, name: true, startDate: true, endDate: true },
  });

  if (!tournament) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Mes inscriptions tournoi</h1>
            <p className="text-sm text-muted-foreground">
              Aucun tournoi actif n&apos;est disponible actuellement.
            </p>
          </div>
        </header>
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Tournoi indisponible</CardTitle>
            <CardDescription>
              Revenez plus tard pour consulter vos inscriptions.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const registrations = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id,
      OR: [
        { userId: session.user.id },
        ...(userEmail
          ? [
              {
                contactEmail: {
                  equals: userEmail,
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
      ],
    },
    orderBy: [{ player: { nom: "asc" } }, { player: { prenom: "asc" } }],
    select: {
      id: true,
      status: true,
      player: {
        select: {
          nom: true,
          prenom: true,
          licence: true,
          points: true,
          club: true,
        },
      },
      registrationEvents: {
        orderBy: [{ event: { startAt: "asc" } }],
        select: {
          id: true,
          status: true,
          event: {
            select: {
              code: true,
              label: true,
              startAt: true,
              feeOnlineCents: true,
            },
          },
        },
      },
      payments: {
        select: {
          amountCents: true,
          status: true,
        },
      },
    },
  });

  const totalDueCents = registrations.reduce(
    (sum, registration) =>
      sum +
      registration.registrationEvents.reduce(
        (eventSum, entry) => eventSum + entry.event.feeOnlineCents,
        0,
      ),
    0,
  );

  const totalPaidCents = registrations.reduce(
    (sum, registration) =>
      sum +
      registration.payments
        .filter((payment) => payment.status === "PAID")
        .reduce((paymentSum, payment) => paymentSum + payment.amountCents, 0),
    0,
  );

  const totalRemainingCents = Math.max(totalDueCents - totalPaidCents, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes inscriptions tournoi</h1>
          <p className="text-sm text-muted-foreground">
            Récapitulatif de vos joueurs inscrits sur{" "}
            <strong>{tournament.name}</strong> du{" "}
            {DATE_FORMATTER.format(tournament.startDate)} au{" "}
            {DATE_FORMATTER.format(tournament.endDate)}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="mailto:inscriptions-tournoi@cctt.fr?subject=Question%20paiement%20tournoi">
              Contacter
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://tournoi.cctt.fr"
              target="_blank"
              rel="noreferrer"
            >
              Payer en ligne
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> Joueurs inscrits
            </CardDescription>
            <CardTitle>{registrations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" /> Montant total
            </CardDescription>
            <CardTitle>{formatAmount(totalDueCents)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Déjà payé
            </CardDescription>
            <CardTitle className="text-emerald-500">
              {formatAmount(totalPaidCents)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {registrations.length > 0 ? (
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Paiement côté joueur</CardTitle>
            <CardDescription>
              {totalRemainingCents > 0
                ? `Il reste ${formatAmount(totalRemainingCents)} à régler pour finaliser vos inscriptions.`
                : "Tout est réglé. Vos inscriptions sont entièrement payées pour ce tournoi."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {registrations.length === 0 ? (
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Aucun joueur inscrit</CardTitle>
            <CardDescription>
              Vous pouvez ajouter votre premier joueur depuis le formulaire
              d&apos;inscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/tournoi/inscription">Inscrire un joueur</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-6">
          {registrations.map((registration) => {
            const playerName = `${registration.player.prenom} ${registration.player.nom}`;
            const paidCents = registration.payments
              .filter((payment) => payment.status === "PAID")
              .reduce((sum, payment) => sum + payment.amountCents, 0);
            const dueCents = registration.registrationEvents.reduce(
              (sum, entry) => sum + entry.event.feeOnlineCents,
              0,
            );
            const remainingCents = Math.max(dueCents - paidCents, 0);

            return (
              <Card
                key={registration.id}
                className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                    <span>{playerName}</span>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {getRegistrationStatusLabel(registration.status)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Licence {registration.player.licence}
                    {registration.player.club
                      ? ` • ${registration.player.club}`
                      : ""}
                    {registration.player.points !== null
                      ? ` • ${registration.player.points} pts`
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tableau</TableHead>
                        <TableHead>Horaire</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registration.registrationEvents.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.event.code} - {entry.event.label}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {DATE_TIME_FORMATTER.format(entry.event.startAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatAmount(entry.event.feeOnlineCents)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {getEventStatusLabel(entry.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <p className="text-sm text-muted-foreground">
                    Paiement : <strong>{formatAmount(paidCents)}</strong> /{" "}
                    {formatAmount(dueCents)}
                  </p>
                  {remainingCents > 0 ? (
                    <p className="text-sm text-amber-500">
                      Reste à payer : {formatAmount(remainingCents)}
                    </p>
                  ) : (
                    <p className="text-sm text-emerald-500">Dossier soldé</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
}
