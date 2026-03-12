import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

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
          : `jusqu'à ${event.maxPoints} pts`;

  const genderLabel =
    event.gender === "M" ? "Messieurs" : event.gender === "F" ? "Dames" : "Mixte";

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
  const tournament = await prisma.tournament.findFirst({
    where: {
      status: {
        in: ["PUBLISHED", "DRAFT"],
      },
    },
    orderBy: [{ startDate: "desc" }],
    select: {
      name: true,
      events: {
        where: {
          status: "OPEN",
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
        },
      },
    },
  });

  const tableOptions = (tournament?.events ?? []).map((event) => ({
    value: event.code,
    label: formatEventLabel(event),
    dateLabel: formatEventDateLabel(event.startAt),
    dateKey: event.startAt.toISOString().split("T")[0],
    minPoints: event.minPoints,
    maxPoints: event.maxPoints,
    gender: event.gender,
    onlinePriceLabel: `${(event.feeOnlineCents / 100).toFixed(0)}€`,
    onsitePriceLabel: `${(event.feeOnsiteCents / 100).toFixed(0)}€`,
  }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Card className="shadow-sm border-border tournament-panel">
        <CardHeader className="space-y-3">
          <CardTitle>
            Inscription{" "}
            {tournament?.name ? `au ${tournament.name}` : "au Tournoi"}
          </CardTitle>
          <p className="text-muted-foreground">
            Suivez les 3 étapes du formulaire pour envoyer votre demande
            d&apos;inscription. Nous vous confirmons votre place par email sous 48 h maximum,
            après vérification des disponibilités dans les tableaux sélectionnés.
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
            <a
              href="/tournoi/mes-inscriptions"
              className="inline-flex justify-center rounded-md border border-border px-5 py-2 text-foreground transition hover:bg-accent/40"
            >
              Voir mes inscriptions
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
