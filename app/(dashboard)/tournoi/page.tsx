import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import TrackedLink from "@/components/TrackedLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";
import { getServerSession } from "next-auth";

const informationsTournoi = {
  nom: "Tournoi National de Paques 2026",
  organisateur: "Chalons en Champagne TT",
  lieu: "Gymnase Kiezer, 150 avenue des Allies, Chalons en Champagne",
  tables: 30,
  homologation: "FFTT",
  format: {
    matchs: "Best of 5 games",
    poules: "Poules de 3 joueurs",
    qualifies: "2 qualifies par poule",
    phaseFinale: "Elimination directe",
  },
  inscriptions: {
    dateLimite: "04/04/2026",
    chequeLimite: "02/04/2026",
    paiementEnLigne: "04/04/2026",
    remboursement: "50% remboursement sur justificatif medical uniquement",
  },
  contact: {
    nom: "Jean Marc HAUTIER",
    telephone: "06 66 09 69 16",
    email: "jean-marc.hautier@wanadoo.fr",
    site: "https://cctt.fr",
    paiement: "https://tournoi.cctt.fr",
  },
};

function formatCategory(
  minPoints: number | null,
  maxPoints: number | null,
  label: string,
) {
  if (label.trim().length > 0) {
    return label;
  }

  if (minPoints === null && maxPoints === null) {
    return "Toutes categories";
  }

  if (minPoints === null) {
    return `Jusqu'a ${maxPoints} pts`;
  }

  if (maxPoints === null) {
    return `${minPoints}+ pts`;
  }

  return `${minPoints} a ${maxPoints} pts`;
}

function formatDateLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(startAt);
}

function formatTimeLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(startAt);
}

async function getOpenTournamentEvents() {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        status: {
          in: ["PUBLISHED", "DRAFT"],
        },
      },
      orderBy: [{ startDate: "desc" }],
      select: {
        events: {
          where: {
            status: "OPEN",
          },
          orderBy: [{ startAt: "asc" }, { code: "asc" }],
          select: {
            id: true,
            code: true,
            label: true,
            startAt: true,
            minPoints: true,
            maxPoints: true,
            feeOnlineCents: true,
            feeOnsiteCents: true,
          },
        },
      },
    });

    return tournament?.events ?? [];
  } catch {
    return [];
  }
}

export default async function TournoiHomePage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.trim().toLowerCase();
  const tournamentEvents = await getOpenTournamentEvents();

  const tournament = await prisma.tournament.findFirst({
    where: {
      status: {
        in: ["PUBLISHED", "DRAFT"],
      },
    },
    orderBy: [{ startDate: "desc" }],
    select: { id: true },
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

  const tableaux = tournamentEvents.map((event) => ({
    id: event.id,
    code: event.code,
    date: formatDateLabel(event.startAt),
    heure: formatTimeLabel(event.startAt),
    categorie: formatCategory(event.minPoints, event.maxPoints, event.label),
    online: `${(event.feeOnlineCents / 100).toFixed(0)} EUR`,
    surPlace: `${(event.feeOnsiteCents / 100).toFixed(0)} EUR`,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <KpiPageViewTracker page="tournoi" label="tournoi-page" />
      <section className="rounded-2xl border bg-card/50 p-6 md:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            {informationsTournoi.organisateur}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            {informationsTournoi.nom}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Tournoi homologue {informationsTournoi.homologation} sur{" "}
            {informationsTournoi.tables} tables, du samedi 4 au lundi 6 avril 2026.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {tournamentRegistrationContent.message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <TrackedLink
            kpiPage="tournoi"
            kpiLabel="cta-inscription"
            href={tournamentRegistrationContent.cta.href}
            className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground transition hover:opacity-90"
          >
            {tournamentRegistrationContent.cta.label}
          </TrackedLink>
          <a
            href="/tournoi/reglement"
            className="inline-flex justify-center rounded-md border border-primary px-6 py-3 text-primary transition hover:bg-primary/10"
          >
            Consulter le reglement 2026
          </a>
          {hasUserRegistration ? (
            <a
              href="/user/inscriptions"
              className="inline-flex justify-center rounded-md border border-border px-6 py-3 text-foreground transition hover:bg-accent/40"
            >
              Voir mes inscriptions
            </a>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Dates", value: "4 - 6 avril 2026" },
            { label: "Lieu", value: informationsTournoi.lieu },
            { label: "Tables", value: `${informationsTournoi.tables} tables` },
            {
              label: "Paiement en ligne",
              value: `Jusqu'au ${informationsTournoi.inscriptions.paiementEnLigne}`,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations pratiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Lieu :</strong> {informationsTournoi.lieu}
            </p>
            <p>
              <strong>Format :</strong> {informationsTournoi.format.matchs},{" "}
              {informationsTournoi.format.poules},{" "}
              {informationsTournoi.format.qualifies}, puis{" "}
              {informationsTournoi.format.phaseFinale}.
            </p>
            <p>
              <strong>Inscriptions :</strong> jusqu&apos;au{" "}
              {informationsTournoi.inscriptions.dateLimite} (paiement en ligne
              possible jusqu&apos;au{" "}
              {informationsTournoi.inscriptions.paiementEnLigne}).
            </p>
            <p>
              <strong>Cheque :</strong> jusqu&apos;au{" "}
              {informationsTournoi.inscriptions.chequeLimite}.{" "}
              {informationsTournoi.inscriptions.remboursement}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact organisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Responsable :</strong> {informationsTournoi.contact.nom}
            </p>
            <p>
              <strong>Telephone :</strong>{" "}
              {informationsTournoi.contact.telephone}
            </p>
            <p>
              <strong>Email :</strong> {informationsTournoi.contact.email}
            </p>
            <p>
              <strong>Site :</strong> {informationsTournoi.contact.site}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Tableaux et horaires</CardTitle>
          </CardHeader>
          <CardContent>
            {tableaux.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun tableau ouvert n&apos;est disponible pour le moment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4">Code</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Heure</th>
                      <th className="py-2 pr-4">Categorie</th>
                      <th className="py-2 pr-4">En ligne</th>
                      <th className="py-2">Sur place</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableaux.map((tableau) => (
                      <tr key={tableau.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-semibold">
                          {tableau.code}
                        </td>
                        <td className="py-2 pr-4">{tableau.date}</td>
                        <td className="py-2 pr-4">{tableau.heure}</td>
                        <td className="py-2 pr-4">{tableau.categorie}</td>
                        <td className="py-2 pr-4">{tableau.online}</td>
                        <td className="py-2">{tableau.surPlace}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Les tarifs en ligne et sur place s&apos;appliquent par tableau. En
              cas de forfait medical, le remboursement suit les conditions FFTT.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}








