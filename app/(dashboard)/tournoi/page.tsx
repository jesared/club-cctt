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
  lieu: "Gymnase Kiezer, 150 avenue des Alliés, Chalons en Champagne",
  tables: 30,
  homologation: "FFTT",
  format: {
    matchs: "Best of 5 games",
    poules: "Poules de 3 joueurs",
    qualifies: "2 qualifiés par poule",
    phaseFinale: "Élimination directe",
  },
  inscriptions: {
    dateLimite: "04/04/2026",
    chequeLimite: "02/04/2026",
    paiementEnLigne: "04/04/2026",
    remboursement: "50% remboursement sur justificatif médical uniquement",
  },
  contact: {
    nom: "Jean Marc HAUTIER",
    telephone: "06 66 09 69 16",
    email: "jean-marc.hautier@wanadoo.fr",
    site: "https://cctt.fr",
    paiement: "https://tournoi.cctt.fr",
  },
};

const rythmeEditorial = [
  {
    phase: "Avant le tournoi",
    frequence: "3 publications / semaine",
    contenus: [
      "Ouverture des inscriptions",
      "Présentation des tableaux",
      "Portraits de bénévoles et partenaires",
    ],
  },
  {
    phase: "Pendant le tournoi",
    frequence: "Stories quotidiennes + 1 récap/jour",
    contenus: [
      "Résultats clés de la journée",
      "Photos ambiance salle",
      "Moments forts et coulisses",
    ],
  },
  {
    phase: "Après le tournoi",
    frequence: "2 publications la semaine suivante",
    contenus: [
      "Podiums et remerciements",
      "Best-of photos/vidéos",
      "Annonce de la prochaine édition",
    ],
  },
];

const preuvesSociales = [
  {
    titre: "Participation en hausse",
    valeur: "24 tableaux ouverts",
    detail:
      "Un volume qui confirme l'attractivité du tournoi au niveau régional et national.",
  },
  {
    titre: "Engagement du public",
    valeur: "300+ visiteurs sur le week-end",
    detail:
      "Parents, supporters et clubs partenaires présents pour soutenir les joueurs.",
  },
  {
    titre: "Confiance des clubs",
    valeur: "Retours positifs récurrents",
    detail:
      "Des témoignages mis en avant après chaque édition pour rassurer les futurs participants.",
  },
];

function formatCategory(
  minPoints: number | null,
  maxPoints: number | null,
  label: string,
) {
  if (label.trim().length > 0) {
    return label;
  }

  if (minPoints === null && maxPoints === null) {
    return "Toutes catégories";
  }

  if (minPoints === null) {
    return `Jusqu'à ${maxPoints} pts`;
  }

  if (maxPoints === null) {
    return `${minPoints}+ pts`;
  }

  return `${minPoints} à ${maxPoints} pts`;
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
    online: `${(event.feeOnlineCents / 100).toFixed(0)}€`,
    surPlace: `${(event.feeOnsiteCents / 100).toFixed(0)}€`,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <KpiPageViewTracker page="tournoi" label="tournoi-page" />
      <Card className="bg-transparent border-0">
        <CardHeader>
          <p className="mb-2 text-sm uppercase tracking-wide text-primary">
            {informationsTournoi.organisateur}
          </p>
          <CardTitle className="text-3xl md:text-4xl">
            {informationsTournoi.nom}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Tournoi homologué {informationsTournoi.homologation} sur{" "}
            {informationsTournoi.tables} tables, du samedi 4 au lundi 6 avril
            2026.
          </p>

          <p>{tournamentRegistrationContent.message}</p>

          <div className="flex flex-col sm:flex-row gap-4">
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
              Consulter le règlement 2026
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
        </CardContent>
      </Card>

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
              <strong>Téléphone :</strong>{" "}
              {informationsTournoi.contact.telephone}
            </p>
            <p>
              <strong>Email :</strong> {informationsTournoi.contact.email}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Tableaux (avec horaires)</CardTitle>
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
                    <tr className="border-b text-left">
                      <th className="py-2 pr-4">Code</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Heure</th>
                      <th className="py-2 pr-4">Catégorie</th>
                      <th className="py-2 pr-4">Online</th>
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
              Chèque jusqu&apos;au{" "}
              {informationsTournoi.inscriptions.chequeLimite}.{" "}
              {informationsTournoi.inscriptions.remboursement}.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rythme éditorial du tournoi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Pour garder le tournoi visible et régulier, nous publions des
              contenus avant, pendant et après l&apos;évènement selon un
              planning clair.
            </p>

            <div className="space-y-4">
              {rythmeEditorial.map((item) => (
                <div key={item.phase} className="rounded-lg border p-4">
                  <p className="font-semibold text-foreground">{item.phase}</p>
                  <p className="text-sm text-primary">{item.frequence}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {item.contenus.map((contenu) => (
                      <li key={contenu}>{contenu}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preuves sociales mises en avant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Les preuves sociales permettent de montrer la crédibilité du
              tournoi et d&apos;encourager de nouvelles inscriptions.
            </p>

            <div className="grid gap-3">
              {preuvesSociales.map((preuve) => (
                <div key={preuve.titre} className="rounded-lg border p-4">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {preuve.titre}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {preuve.valeur}
                  </p>
                  <p className="text-sm mt-1">{preuve.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
