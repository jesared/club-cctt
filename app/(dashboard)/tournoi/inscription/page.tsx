import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import Reveal from "@/components/Reveal";
import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
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
      ? "Toutes categories"
      : event.minPoints !== null && event.maxPoints !== null
        ? `${event.minPoints} a ${event.maxPoints} pts`
        : event.minPoints !== null
          ? `${event.minPoints}+ pts`
          : `Jusqu'a ${event.maxPoints} pts`;

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
      status: "PUBLISHED",
    },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      status: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
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
  const registrationStatus = getTournamentRegistrationStatus(tournament);

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
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-14">
      <KpiPageViewTracker page="tournoi-inscription" label="inscription-page" />

      <Reveal>
        <header className="max-w-3xl space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Tournoi CCTT
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Inscription {tournament?.name ? `au ${tournament.name}` : "au Tournoi"}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {registrationStatus.canRegister
              ? "Le parcours ci-dessous guide l'inscription du joueur, filtre les tableaux compatibles et affiche un recapitulatif avant validation."
              : registrationStatus.message}
          </p>
        </header>
      </Reveal>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <Reveal>
          <Card className="border-border shadow-sm">
            {registrationStatus.canRegister ? (
              <>
                <CardHeader className="gap-5 border-b border-border/70 bg-gradient-to-b from-muted/25 to-background">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-primary">
                      Inscriptions ouvertes
                    </span>
                    <span className="rounded-full border border-border bg-background px-3 py-1">
                      Tableaux filtres automatiquement
                    </span>
                    <span className="rounded-full border border-border bg-background px-3 py-1">
                      Confirmation apres verification
                    </span>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">
                      Un parcours plus simple pour s&apos;inscrire
                    </CardTitle>
                    <CardDescription className="max-w-3xl text-sm leading-relaxed">
                      Le formulaire fonctionne maintenant comme un vrai tunnel :
                      d&apos;abord le profil du joueur, ensuite les tableaux
                      compatibles, puis un recapitulatif clair avant l&apos;envoi.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6">
                  <TournamentRegistrationForm tableOptions={tableOptions} />
                </CardContent>
              </>
            ) : (
              <CardContent className="space-y-4 p-6">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground">
                  <p className="font-medium">{registrationStatus.label}</p>
                  <p className="mt-1 text-muted-foreground">
                    {registrationStatus.message}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  La page reste utile pour consulter les tableaux, verifier les
                  volumes ouverts et retrouver le contact inscriptions.
                </div>
              </CardContent>
            )}
          </Card>
        </Reveal>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <Reveal delay={80}>
            <Card className="border-border shadow-sm">
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">Reperes rapides</CardTitle>
                <CardDescription>
                  Les informations pratiques a garder sous la main.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {[
                    { label: "Tableaux ouverts", value: `${openTables}` },
                    { label: "Tableaux complets", value: `${fullTables}` },
                    { label: "Total tableaux", value: `${totalTables}` },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    A preparer avant de commencer
                  </p>
                  <div className="mt-3 space-y-2 text-muted-foreground">
                    <p>Numero de licence FFTT et total de points actuel.</p>
                    <p>Coordonnees de contact pour la confirmation.</p>
                    <p>Choix des tableaux souhaites et eventuelle attente.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    Comment lire les statuts
                  </p>
                  <div className="mt-3 space-y-2 text-muted-foreground">
                    <p>
                      {openTables} tableau{openTables > 1 ? "x" : ""} ouvert
                      {openTables > 1 ? "s" : ""} a l&apos;inscription directe.
                    </p>
                    <p>
                      {fullTables} tableau{fullTables > 1 ? "x" : ""} complet
                      {fullTables > 1 ? "s" : ""} avec attente possible.
                    </p>
                    <p>
                      Les tableaux non compatibles restent visibles pour
                      expliquer le filtrage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={140}>
            <Card className="border-border shadow-sm">
              <CardHeader className="gap-2">
                <CardTitle className="text-lg">Besoin d&apos;aide ?</CardTitle>
                <CardDescription>
                  Un doute avant validation ou une question sur un tableau.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-foreground">
                  <p>
                    Contact inscriptions :{" "}
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
                    Retour a la page tournoi
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

          {hasUserRegistration ? (
            <Reveal delay={200}>
              <Card className="border-border shadow-sm">
                <CardHeader className="gap-2">
                  <CardTitle className="text-lg">
                    Inscription deja enregistree
                  </CardTitle>
                  <CardDescription>
                    Votre compte possede deja au moins une demande pour ce
                    tournoi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Vous pouvez toujours consulter l&apos;etat de vos inscriptions
                  existantes depuis votre espace utilisateur.
                </CardContent>
              </Card>
            </Reveal>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
