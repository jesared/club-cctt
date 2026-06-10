/* eslint-disable react/no-unescaped-entities */

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Gauge,
  Sparkles,
  TimerReset,
  Trophy,
  UserRoundCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";

type AuditTone = "strong" | "watch" | "priority";

type AuditScorecard = {
  title: string;
  score: string;
  tone: AuditTone;
  summary: string;
  detail: string;
};

type AuditFinding = {
  title: string;
  detail: string;
};

type AuditAction = {
  title: string;
  detail: string;
  impact: string;
  effort: string;
};

const scorecards: AuditScorecard[] = [
  {
    title: "Découverte du club",
    score: "4.5 / 5",
    tone: "strong",
    summary: "Le site aide mieux à choisir une porte d'entrée dès l'accueil.",
    detail:
      "Les cartes d'intention, la hiérarchie des CTA et les pages club rendent le parcours plus lisible qu'avant pour un nouveau visiteur.",
  },
  {
    title: "Page tournoi",
    score: "4.2 / 5",
    tone: "strong",
    summary: "Le statut, les tableaux et l'action principale sont enfin réunis.",
    detail:
      "La page /tournoi centralise les informations utiles et réduit les allers-retours inutiles avant inscription.",
  },
  {
    title: "Tunnel d'inscription",
    score: "3.7 / 5",
    tone: "watch",
    summary: "Le tunnel guidé est solide, mais encore dense sur mobile.",
    detail:
      "Le filtrage par points et genre est clair, mais l'étape profil reste longue avant que l'utilisateur voie toute la valeur de l'interface.",
  },
  {
    title: "Suivi après inscription",
    score: "3.1 / 5",
    tone: "priority",
    summary: "Le self-service progresse, mais le paiement reste fragmenté.",
    detail:
      "L'espace joueur aide à relire son dossier, mais la continuité entre inscription, paiement et prochaines actions n'est pas encore totalement fluide.",
  },
];

const strengths: AuditFinding[] = [
  {
    title: "L'ancien flou sur le tournoi a été largement réduit.",
    detail:
      "La page tournoi donne maintenant le statut d'inscription, les dates, les tableaux et les raccourcis utiles sans disperser l'utilisateur.",
  },
  {
    title: "Le formulaire d'inscription raconte un vrai parcours.",
    detail:
      "Progression en 3 étapes, filtrage automatique, messages d'aide et récapitulatif avant envoi apportent de la réassurance.",
  },
  {
    title: "Le back-office nourrit mieux l'expérience publique.",
    detail:
      "Les contenus éditoriaux, les tableaux tournoi et le suivi utilisateur créent une base beaucoup plus administrable qu'un simple site vitrine.",
  },
];

const priorities: AuditFinding[] = [
  {
    title: "Le paiement reste une rupture de parcours.",
    detail:
      "L'inscription est intégrée au site, mais le règlement repart encore sur un lien externe depuis l'espace joueur, ce qui casse la continuité mentale.",
  },
  {
    title: "L'instrumentation conversion reste trop macro.",
    detail:
      "On mesure la vue, le clic, le démarrage et l'envoi, mais pas encore les frictions intermédiaires ni les abandons sur les champs clés.",
  },
  {
    title: "Les états dégradés sont plus visibles qu'avant, mais pas encore assez pédagogiques.",
    detail:
      "Les pages horaires et comité exposent bien la fraîcheur des données, mais le message utilisateur peut encore être plus explicite quand la donnée est ancienne ou incomplète.",
  },
  {
    title: "L'étape profil du formulaire concentre encore beaucoup de charge cognitive.",
    detail:
      "Huit informations sont demandées d'un bloc avant d'ouvrir pleinement le choix des tableaux, ce qui peut fatiguer sur téléphone.",
  },
];

const recommendedActions: AuditAction[] = [
  {
    title: "Fermer la boucle inscription → paiement → confirmation",
    detail:
      "Transformer l'après-inscription en parcours unique avec état du dossier, montant restant et prochaine action prioritaire sur une seule surface.",
    impact: "Très fort",
    effort: "Moyen",
  },
  {
    title: "Alléger l'étape profil du joueur",
    detail:
      "Regrouper les champs en sous-blocs, afficher davantage de réassurance et envisager une aide par numéro de licence pour réduire l'effort perçu.",
    impact: "Fort",
    effort: "Moyen",
  },
  {
    title: "Mesurer les micro-frictions du tunnel",
    detail:
      "Tracer les erreurs fréquentes, les abandons par étape et les usages liste d'attente pour savoir précisément quoi optimiser ensuite.",
    impact: "Fort",
    effort: "Faible",
  },
];

const roadmap = {
  "30 jours": [
    "Tracer aussi les CTA home/contact vers le tournoi et les erreurs de validation du formulaire.",
    "Clarifier l'après-envoi avec un message plus direct sur le délai, le paiement et la prochaine action attendue.",
    "Renforcer les états dégradés des pages horaires/comité avec un langage orienté utilisateur plutôt qu'orienté source.",
  ],
  "60 jours": [
    "Réduire la densité de l'étape profil sur mobile avec une progression plus séquencée.",
    "Créer une surface de suivi unique pour dossier, paiement, tableaux choisis et éventuelle attente.",
    "Ajouter des relances automatiques sur dossiers incomplets ou paiements en attente.",
  ],
  "90 jours": [
    "Construire un tableau de bord funnel par étape pour piloter les optimisations sur données réelles.",
    "Tester plusieurs formulations de CTA tournoi selon l'état d'ouverture des inscriptions.",
    "Mieux relier pages club, tournoi et contact autour de scénarios d'entrée clairs.",
  ],
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "long",
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatPercent(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return "—";
  }

  return `${Math.round((numerator / denominator) * 100)} %`;
}

function getToneClasses(tone: AuditTone) {
  if (tone === "strong") {
    return {
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
    };
  }

  if (tone === "watch") {
    return {
      border: "border-amber-500/30",
      badge: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    };
  }

  return {
    border: "border-rose-500/30",
    badge: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  };
}

function getToneLabel(tone: AuditTone) {
  if (tone === "strong") {
    return "Point fort";
  }

  if (tone === "watch") {
    return "À surveiller";
  }

  return "Priorité";
}

function buildFunnelNarrative({
  tournoiViews,
  tournoiClicks,
  inscriptionViews,
  starts,
  submits,
}: {
  tournoiViews: number;
  tournoiClicks: number;
  inscriptionViews: number;
  starts: number;
  submits: number;
}) {
  if (tournoiViews === 0 && inscriptionViews === 0) {
    return "Les 30 derniers jours ne fournissent pas encore assez de trafic mesuré pour juger finement le funnel.";
  }

  if (tournoiViews > 0 && tournoiClicks === 0) {
    return "La page tournoi attire des vues, mais le CTA principal n'entraîne pas encore de clic mesuré : priorité à la lisibilité de l'action.";
  }

  if (starts > 0 && submits === 0) {
    return "Des utilisateurs démarrent le formulaire, mais aucun envoi n'est remonté sur la période : l'effort du formulaire ou une friction technique doit être vérifié en premier.";
  }

  if (inscriptionViews > 0 && starts < inscriptionViews / 2) {
    return "La page d'inscription est consultée, mais une part importante du trafic ne démarre pas le tunnel : l'étape d'entrée peut encore mieux rassurer.";
  }

  return "Le funnel mesuré montre une base saine, mais il manque encore le détail des frictions intermédiaires pour prioriser les optimisations avec précision.";
}

export default async function AdminAuditUxPage() {
  await requireAdminSession();

  const now = new Date();
  const since7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const since30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const tournament = await prisma.tournament.findFirst({
    where: { status: { in: ["PUBLISHED", "SUSPENDED"] } },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      status: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      startDate: true,
      endDate: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  const [
    tournoiViews7,
    tournoiClicks7,
    inscriptionViews7,
    starts7,
    submits7,
    tournoiViews30,
    tournoiClicks30,
    inscriptionViews30,
    starts30,
    submits30,
    totalRegistrations,
    pendingRegistrations,
    confirmedRegistrations,
    pendingPayments,
    paidPayments,
    waitlistEntries,
  ] = await Promise.all([
    prisma.kpiEvent.count({
      where: {
        eventType: "VIEW",
        page: "tournoi",
        createdAt: { gte: since7Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "CLICK",
        page: "tournoi",
        createdAt: { gte: since7Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "VIEW",
        page: "tournoi-inscription",
        createdAt: { gte: since7Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "START",
        page: "tournoi-inscription",
        createdAt: { gte: since7Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "SUBMIT",
        page: "tournoi-inscription",
        createdAt: { gte: since7Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "VIEW",
        page: "tournoi",
        createdAt: { gte: since30Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "CLICK",
        page: "tournoi",
        createdAt: { gte: since30Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "VIEW",
        page: "tournoi-inscription",
        createdAt: { gte: since30Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "START",
        page: "tournoi-inscription",
        createdAt: { gte: since30Days },
      },
    }),
    prisma.kpiEvent.count({
      where: {
        eventType: "SUBMIT",
        page: "tournoi-inscription",
        createdAt: { gte: since30Days },
      },
    }),
    tournament
      ? prisma.tournamentRegistration.count({
          where: { tournamentId: tournament.id },
        })
      : Promise.resolve(0),
    tournament
      ? prisma.tournamentRegistration.count({
          where: { tournamentId: tournament.id, status: "PENDING" },
        })
      : Promise.resolve(0),
    tournament
      ? prisma.tournamentRegistration.count({
          where: { tournamentId: tournament.id, status: "CONFIRMED" },
        })
      : Promise.resolve(0),
    tournament
      ? prisma.tournamentPayment.count({
          where: {
            registration: { tournamentId: tournament.id },
            status: "PENDING",
          },
        })
      : Promise.resolve(0),
    tournament
      ? prisma.tournamentPayment.count({
          where: {
            registration: { tournamentId: tournament.id },
            status: "PAID",
          },
        })
      : Promise.resolve(0),
    tournament
      ? prisma.tournamentRegistrationEvent.count({
          where: {
            registration: { tournamentId: tournament.id },
            status: "WAITLISTED",
          },
        })
      : Promise.resolve(0),
  ]);

  const registrationStatus = getTournamentRegistrationStatus(tournament);
  const funnelNarrative = buildFunnelNarrative({
    tournoiViews: tournoiViews30,
    tournoiClicks: tournoiClicks30,
    inscriptionViews: inscriptionViews30,
    starts: starts30,
    submits: submits30,
  });

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card px-6 py-7 shadow-sm sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2F6BFF] via-[#00D9FF] to-[#FF7A00]" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Audit mis à jour le {formatDate(now)}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-[#FF7A00]/30 bg-[#FF7A00]/10 px-3 py-1 text-[#FF7A00]"
              >
                {registrationStatus.label}
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Administration
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Audit UX 2026 du parcours club et tournoi
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                L'ancien audit était devenu trop statique. Cette version reflète
                mieux le site actuel, ses gains réels et les frictions qui
                restent à traiter pour convertir plus sereinement.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-sm border-border/70 bg-background/80 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Verdict rapide</CardTitle>
              <CardDescription>
                Le socle est nettement meilleur qu'avant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p>
                  Orientation, page tournoi et tunnel d'inscription racontent
                  désormais une histoire cohérente.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                <p>
                  Les plus gros gains sont maintenant dans l'après-inscription,
                  la continuité paiement et la mesure fine des abandons.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Vues tournoi sur 7 jours
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatNumber(tournoiViews7)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Clic CTA mesuré : {formatPercent(tournoiClicks7, tournoiViews7)}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vues inscription sur 7 jours
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatNumber(inscriptionViews7)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Démarrage formulaire : {formatPercent(starts7, inscriptionViews7)}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Formulaires démarrés sur 7 jours
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatNumber(starts7)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Taux d'envoi : {formatPercent(submits7, starts7)}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Dossiers tournoi actifs
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatNumber(totalRegistrations)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Confirmés : {formatNumber(confirmedRegistrations)} · En attente :{" "}
            {formatNumber(pendingRegistrations)}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {scorecards.map((item) => {
          const tone = getToneClasses(item.tone);

          return (
            <Card key={item.title} className={tone.border}>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-1 ${tone.badge}`}
                  >
                    {getToneLabel(item.tone)}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {item.score}
                  </span>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.summary}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Ce qui fonctionne mieux aujourd'hui
            </CardTitle>
            <CardDescription>
              L'audit mis à jour tient compte des améliorations réellement
              visibles dans le produit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengths.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Frictions encore prioritaires
            </CardTitle>
            <CardDescription>
              Les prochains gains conversion se situent surtout ici.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorities.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">Lecture du funnel mesuré (30 jours)</CardTitle>
            <CardDescription>
              Vues, clics, démarrages et soumissions remontés actuellement dans
              le tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Vues tournoi",
                  value: tournoiViews30,
                  detail: "Base de trafic",
                },
                {
                  label: "Clics CTA",
                  value: tournoiClicks30,
                  detail: formatPercent(tournoiClicks30, tournoiViews30),
                },
                {
                  label: "Starts formulaire",
                  value: starts30,
                  detail: formatPercent(starts30, inscriptionViews30),
                },
                {
                  label: "Soumissions",
                  value: submits30,
                  detail: formatPercent(submits30, starts30),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatNumber(item.value)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-relaxed text-muted-foreground">
              {funnelNarrative}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">Signal opérationnel tournoi</CardTitle>
            <CardDescription>
              Lecture rapide de la charge à absorber côté dossier et paiement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">
                {tournament?.name ?? "Aucun tournoi publié"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tournament
                  ? `${tournament._count.events} tableaux configurés · ${registrationStatus.message}`
                  : "Cette page affichera davantage de signaux dès qu'un tournoi publié sera disponible."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Dossiers en attente",
                  value: pendingRegistrations,
                  icon: TimerReset,
                },
                {
                  label: "Paiements en attente",
                  value: pendingPayments,
                  icon: CreditCard,
                },
                {
                  label: "Paiements validés",
                  value: paidPayments,
                  icon: CheckCircle2,
                },
                {
                  label: "Demandes en attente",
                  value: waitlistEntries,
                  icon: UserRoundCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {formatNumber(item.value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ArrowRight className="h-5 w-5 text-primary" />
              Les 3 actions à lancer en priorité
            </CardTitle>
            <CardDescription>
              Priorisation mise à jour selon l'état actuel du produit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedActions.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Impact {item.impact}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Effort {item.effort}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">Feuille de route 30 / 60 / 90 jours</CardTitle>
            <CardDescription>
              Suite logique recommandée après ce nouvel audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(roadmap).map(([label, items]) => (
              <article
                key={label}
                className="rounded-[1.6rem] border border-border/70 bg-background/80 p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[140px_1fr] lg:gap-6">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Horizon
                    </p>
                    <div className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {label}
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                      >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
