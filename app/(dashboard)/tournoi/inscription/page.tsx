import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import Reveal from "@/components/Reveal";
import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

function formatEventLabel(event: {
  code: string;
  label: string;
  startAt: Date;
  minPoints: number | null;
  maxPoints: number | null;
  gender: "MIXED" | "M" | "F";
}) {
  const startHour = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(event.startAt);

  const pointsRange =
    event.minPoints === null && event.maxPoints === null
      ? "Toutes catégories"
      : event.minPoints !== null && event.maxPoints !== null
        ? `${event.minPoints} à ${event.maxPoints} pts`
        : event.minPoints !== null
          ? `${event.minPoints}+ pts`
          : `Jusqu'à ${event.maxPoints} pts`;

  const genderLabel =
    event.gender === "M"
      ? "Messieurs"
      : event.gender === "F"
        ? "Dames"
        : "Mixte";

  const labelParts = [event.label.trim()];

  if (
    pointsRange &&
    event.label.trim().toLowerCase() !== pointsRange.trim().toLowerCase()
  ) {
    labelParts.push(pointsRange);
  }

  if (event.gender !== "MIXED") {
    const normalizedLabel = event.label.trim().toLowerCase();
    const normalizedGenderLabel = genderLabel.toLowerCase();
    if (!normalizedLabel.includes(normalizedGenderLabel)) {
      labelParts.push(genderLabel);
    }
  }

  return `${event.code} (${labelParts.join(" - ")}) - ${startHour}`;
}

function formatEventDateLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(startAt);
}

export default async function InscriptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/tournoi/inscription");
  }
  const userEmail = session?.user?.email?.trim().toLowerCase();

  const tournament = await prisma.tournament.findFirst({
    where: {
      status: {
        in: ["PUBLISHED", "DRAFT"],
      },
    },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      events: {
        where: {
          status: { in: ["OPEN", "FULL"] },
        },
        orderBy: [{ startAt: "asc" }, { code: "asc" }],
        select: {
          code: true,
          label: true,
          gender: true,
          minPoints: true,
          maxPoints: true,
          startAt: true,
          feeOnlineCents: true,
          feeOnsiteCents: true,
          maxPlayers: true,
          _count: {
            select: {
              registrationEvents: {
                where: {
                  status: {
                    in: ["REGISTERED", "CHECKED_IN"],
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const tableOptions = (tournament?.events ?? []).map((event) => {
    const maxPlayers = event.maxPlayers ?? null;
    const registrations = event._count.registrationEvents;
    const remainingSpots =
      maxPlayers !== null ? Math.max(maxPlayers - registrations, 0) : null;
    const isFull = maxPlayers !== null && registrations >= maxPlayers;

    return {
      value: event.code,
      label: formatEventLabel(event),
      dateLabel: formatEventDateLabel(event.startAt),
      dateKey: event.startAt.toISOString().split("T")[0],
      minPoints: event.minPoints,
      maxPoints: event.maxPoints,
      gender: event.gender,
      onlinePriceLabel: `${(event.feeOnlineCents / 100).toFixed(0)} EUR`,
      onsitePriceLabel: `${(event.feeOnsiteCents / 100).toFixed(0)} EUR`,
      isFull,
      remainingSpots,
    };
  });

  const hasUserRegistration =
    tournament && session?.user?.id
      ? (await prisma.tournamentRegistration.count({
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
        })) > 0
      : false;

  const totalTables = tableOptions.length;
  const fullTables = tableOptions.filter((table) => table.isFull).length;
  const openTables = Math.max(totalTables - fullTables, 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-14 space-y-8">
      <KpiPageViewTracker page="tournoi-inscription" label="inscription-page" />
      <Reveal>
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">
            Inscription {tournament?.name ? `au ${tournament.name}` : "au Tournoi"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Remplissez le formulaire, choisissez vos tableaux, puis validez. Une
            confirmation vous sera envoyée par email après vérification des
            disponibilités.
          </p>
        </header>
      </Reveal>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Tableaux ouverts", value: `${openTables}` },
          { label: "Tableaux complets", value: `${fullTables}` },
          { label: "Total tableaux", value: `${totalTables}` },
        ].map((stat, index) => (
          <Reveal key={stat.label} delay={index * 120}>
            <div className="rounded-xl border bg-card p-4 card-hover">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
          </Reveal>
        ))}
      </section>

      <Reveal>
        <Card className="shadow-sm border-border tournament-panel card-hover">
          <CardHeader className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Compléter le profil",
                  detail: "Nom, licence, points, contact.",
                },
                {
                  step: "2",
                  title: "Choisir les tableaux",
                  detail: "Disponibilités en temps réel.",
                },
                {
                  step: "3",
                  title: "Valider la demande",
                  detail: "Email de confirmation sous 48h.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Étape {item.step}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Les tableaux complets peuvent proposer une liste d&apos;attente si
              vous choisissez de rester candidat.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <TournamentRegistrationForm tableOptions={tableOptions} />
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
              <p>
                <strong>Besoin d&apos;aide&nbsp;?</strong> Contact inscriptions :{" "}
                <a className="underline" href="mailto:communication@cctt.fr">
                  communication@cctt.fr
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/tournoi"
                className="inline-flex justify-center rounded-md border border-primary px-5 py-2 text-primary transition hover:bg-primary/10"
              >
                Retour à la page tournoi
              </a>
              {hasUserRegistration ? (
                <a
                  href="/user/inscriptions"
                  className="inline-flex justify-center rounded-md border border-border px-5 py-2 text-foreground transition hover:bg-accent/40"
                >
                  Voir mes inscriptions
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </main>
  );
}

