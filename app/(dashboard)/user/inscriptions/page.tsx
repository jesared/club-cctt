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
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";

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

type SearchParams = { year?: string };

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function MesInscriptionsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/user/inscriptions");
  }

  const [currentTournament, registrations] = await Promise.all([
    prisma.tournament.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
        status: true,
        registrationOpenAt: true,
        registrationCloseAt: true,
        startDate: true,
        endDate: true,
      },
    }),
    prisma.tournamentRegistration.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { player: { ownerId: session.user.id } },
        ],
      },
      orderBy: [
        { tournament: { startDate: "desc" } },
        { player: { nom: "asc" } },
        { player: { prenom: "asc" } },
      ],
      select: {
        id: true,
        status: true,
        paidAmountCents: true,
        player: {
          select: {
            nom: true,
            prenom: true,
            licence: true,
            points: true,
            club: true,
          },
        },
        tournament: {
          select: { id: true, name: true, startDate: true, endDate: true },
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
    }),
  ]);
  const registrationStatus = getTournamentRegistrationStatus(currentTournament);

  const years = Array.from(
    new Set(
      registrations.map((registration) =>
        registration.tournament.startDate.getFullYear(),
      ),
    ),
  ).sort((a, b) => b - a);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedYear = resolvedSearchParams?.year;
  const selectedYear =
    requestedYear &&
    requestedYear !== "all" &&
    !Number.isNaN(Number(requestedYear))
      ? Number(requestedYear)
      : (years[0] ?? null);

  const filteredRegistrations =
    requestedYear === "all" || !selectedYear
      ? registrations
      : registrations.filter(
          (registration) =>
            registration.tournament.startDate.getFullYear() === selectedYear,
        );

  const totalDueCents = filteredRegistrations.reduce(
    (sum, registration) =>
      sum +
      registration.registrationEvents.reduce(
        (eventSum, entry) => eventSum + entry.event.feeOnlineCents,
        0,
      ),
    0,
  );

  const totalPaidCents = filteredRegistrations.reduce((sum, registration) => {
    const paymentsPaid = registration.payments
      .filter((payment) => payment.status === "PAID")
      .reduce((paymentSum, payment) => paymentSum + payment.amountCents, 0);

    const effectivePaid =
      registration.payments.length > 0
        ? paymentsPaid
        : registration.paidAmountCents;

    return sum + effectivePaid;
  }, 0);

  const totalRemainingCents = Math.max(totalDueCents - totalPaidCents, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes inscriptions tournoi</h1>
          <p className="text-sm text-muted-foreground">
            Récapitulatif de vos joueurs inscrits{" "}
            {selectedYear ? `sur la saison ${selectedYear}` : "toutes saisons"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      {years.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Année
          </span>
          {years.map((year) => (
            <Link
              key={year}
              href={`/user/inscriptions?year=${year}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedYear === year
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {year}
            </Link>
          ))}
          <Link
            href="/user/inscriptions?year=all"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              requestedYear === "all"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Toutes
          </Link>
        </div>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> Joueurs inscrits
            </CardDescription>
            <CardTitle>{filteredRegistrations.length}</CardTitle>
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

      {filteredRegistrations.length > 0 ? (
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Paiement côté joueur</CardTitle>
            <CardDescription>
              {totalRemainingCents > 0
                ? `Il reste ${formatAmount(totalRemainingCents)} à régler pour finaliser vos inscriptions.`
                : "Tout est réglé. Vos inscriptions sont entièrement payées pour cette saison."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {filteredRegistrations.length === 0 ? (
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Aucun joueur inscrit</CardTitle>
            <CardDescription>
              {registrationStatus.canRegister
                ? "Vous pouvez ajouter votre premier joueur depuis le formulaire d'inscription."
                : registrationStatus.message}
            </CardDescription>
          </CardHeader>
          {registrationStatus.canRegister ? (
            <CardContent>
              <Button asChild>
                <Link href="/tournoi/inscription">Inscrire un joueur</Link>
              </Button>
            </CardContent>
          ) : (
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/tournoi">Voir la page tournoi</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <section className="space-y-6">
          {filteredRegistrations.map((registration) => {
            const playerName = `${registration.player.prenom} ${registration.player.nom}`;
            const paymentsPaid = registration.payments
              .filter((payment) => payment.status === "PAID")
              .reduce((sum, payment) => sum + payment.amountCents, 0);
            const dueCents = registration.registrationEvents.reduce(
              (sum, entry) => sum + entry.event.feeOnlineCents,
              0,
            );
            const paidCents =
              registration.payments.length > 0
                ? paymentsPaid
                : registration.paidAmountCents;
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
                    {registration.tournament?.name
                      ? ` • ${registration.tournament.name}`
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
