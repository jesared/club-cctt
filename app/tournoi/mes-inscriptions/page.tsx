import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

function getRegistrationStatusLabel(status: "PENDING" | "CONFIRMED" | "CANCELLED") {
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

function getEventStatusLabel(status: "REGISTERED" | "WAITLISTED" | "CHECKED_IN" | "NO_SHOW" | "FORFEIT") {
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
  const session = await auth();
  const userEmail = session?.user?.email?.trim().toLowerCase();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/tournoi/mes-inscriptions");
  }

  const tournament = await prisma.tournament.findFirst({
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!tournament) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-semibold">Mes inscriptions tournoi</h1>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Aucun tournoi actif n&apos;est disponible pour le moment.
        </p>
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
    orderBy: [
      {
        player: {
          nom: "asc",
        },
      },
      {
        player: {
          prenom: "asc",
        },
      },
    ],
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

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Mes inscriptions tournoi</h1>
        <p className="text-gray-600">
          Récapitulatif de vos joueurs inscrits sur <strong>{tournament.name}</strong> du{" "}
          {DATE_FORMATTER.format(tournament.startDate)} au {DATE_FORMATTER.format(tournament.endDate)}.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs inscrits</p>
          <p className="mt-2 text-3xl font-semibold">{registrations.length}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Montant total</p>
          <p className="mt-2 text-3xl font-semibold">{formatAmount(totalDueCents)}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Déjà payé</p>
          <p className="mt-2 text-3xl font-semibold text-green-700">{formatAmount(totalPaidCents)}</p>
        </article>
      </section>

      {registrations.length === 0 ? (
        <section className="rounded-xl border border-purple-100 bg-purple-50 p-6 text-purple-900">
          <p className="font-medium">Aucun joueur inscrit pour le moment.</p>
          <p className="mt-2 text-sm">
            Vous pouvez ajouter votre premier joueur depuis le formulaire d&apos;inscription.
          </p>
          <a
            href="/tournoi/inscription"
            className="mt-4 inline-flex rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Inscrire un joueur
          </a>
        </section>
      ) : (
        <section className="space-y-4">
          {registrations.map((registration) => {
            const playerName = `${registration.player.prenom} ${registration.player.nom}`;
            const paidCents = registration.payments
              .filter((payment) => payment.status === "PAID")
              .reduce((sum, payment) => sum + payment.amountCents, 0);
            const dueCents = registration.registrationEvents.reduce(
              (sum, entry) => sum + entry.event.feeOnlineCents,
              0,
            );

            return (
              <article key={registration.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{playerName}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Licence {registration.player.licence}
                      {registration.player.club ? ` • ${registration.player.club}` : ""}
                      {registration.player.points !== null ? ` • ${registration.player.points} pts` : ""}
                    </p>
                  </div>
                  <p className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700">
                    {getRegistrationStatusLabel(registration.status)}
                  </p>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4 font-medium">Tableau</th>
                        <th className="pb-2 pr-4 font-medium">Horaire</th>
                        <th className="pb-2 pr-4 font-medium">Engagement</th>
                        <th className="pb-2 pr-4 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registration.registrationEvents.map((entry) => (
                        <tr key={entry.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 text-gray-900">
                            {entry.event.code} - {entry.event.label}
                          </td>
                          <td className="py-2 pr-4 text-gray-700">{DATE_TIME_FORMATTER.format(entry.event.startAt)}</td>
                          <td className="py-2 pr-4 text-gray-700">{formatAmount(entry.event.feeOnlineCents)}</td>
                          <td className="py-2 pr-4 text-gray-700">{getEventStatusLabel(entry.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-sm text-gray-700">
                  Paiement : <strong>{formatAmount(paidCents)}</strong> / {formatAmount(dueCents)}
                </p>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
