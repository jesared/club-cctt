/* eslint-disable react/no-unescaped-entities */

import {
  AlertCircle,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CreditCard,
  Dumbbell,
  FileText,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  buildVisibleNotificationsWhere,
  getDefaultNotificationHref,
} from "@/lib/notifications";
import { withNotificationSchemaFallback } from "@/lib/notification-safety";
import {
  canAccessBureauSpace,
  canAccessClubSpace,
  canAccessEntraineurSpace,
  getRoleLabel,
} from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";
import ProfileClient from "./profile-client";
import UserNotificationsSection from "./user-notifications-section";

type ReservedRoleCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: string;
  cta: string;
};

export default async function UserProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ forbidden?: string }>;
}) {
  const resolved = await searchParams;
  const forbiddenReason = resolved?.forbidden;
  const forbiddenMessage = getForbiddenMessage(forbiddenReason);
  const session = await getCurrentSession();
  const roleLabel = getRoleLabel(session?.user?.role);
  const canAccessClub = canAccessClubSpace(session?.user?.role);
  const canAccessBureau = canAccessBureauSpace(session?.user?.role);
  const canAccessEntraineur = canAccessEntraineurSpace(session?.user?.role);
  const registrationWhere = session?.user?.id
    ? {
        OR: [
          { userId: session.user.id },
          { player: { ownerId: session.user.id } },
        ],
      }
    : undefined;

  const notificationWhere = buildVisibleNotificationsWhere(session?.user?.role);

  const [notifications, unreadNotificationCount, registrationCount, paymentRows] =
    await Promise.all([
      withNotificationSchemaFallback(
        () =>
          prisma.notification.findMany({
            where: notificationWhere,
            orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
            take: 5,
            include: {
              createdByUser: {
                select: {
                  name: true,
                  email: true,
                },
              },
              reads: {
                where: {
                  userId: session?.user?.id ?? "",
                },
                select: {
                  id: true,
                },
                take: 1,
              },
            },
          }),
        [],
      ),
      session?.user?.id
        ? withNotificationSchemaFallback(
            () =>
              prisma.notification.count({
                where: {
                  AND: [
                    notificationWhere,
                    {
                      reads: {
                        none: {
                          userId: session.user.id,
                        },
                      },
                    },
                  ],
                },
              }),
            0,
          )
        : 0,
      registrationWhere
        ? prisma.tournamentRegistration.count({
            where: registrationWhere,
          })
        : 0,
      registrationWhere
        ? prisma.tournamentRegistration.findMany({
            where: registrationWhere,
            select: {
              id: true,
              paidAmountCents: true,
              registrationEvents: {
                select: {
                  event: {
                    select: {
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
          })
        : [],
    ]);

  const pendingPaymentCount = paymentRows.filter((registration) => {
    const totalDueCents = registration.registrationEvents.reduce(
      (sum, entry) => sum + entry.event.feeOnlineCents,
      0,
    );
    const paidFromPayments = registration.payments
      .filter((payment) => payment.status === "PAID")
      .reduce((sum, payment) => sum + payment.amountCents, 0);
    const effectivePaidCents =
      registration.payments.length > 0
        ? paidFromPayments
        : registration.paidAmountCents;

    return totalDueCents > 0 && effectivePaidCents < totalDueCents;
  }).length;

  const dashboardMetrics = [
    {
      label: "Inscriptions",
      value: registrationCount,
      helper: "joueurs ou dossiers suivis",
      icon: CalendarDays,
    },
    {
      label: "Paiements en attente",
      value: pendingPaymentCount,
      helper: "dossiers restant a regler",
      icon: CreditCard,
    },
    {
      label: "Documents",
      value: 0,
      helper: "bibliotheque bientot alimentee",
      icon: FolderOpen,
    },
    {
      label: "Messages non lus",
      value: unreadNotificationCount,
      helper: "elements a consulter",
      icon: BellRing,
    },
  ];
  const actionCards = [
    {
      title: "Mes inscriptions",
      description:
        registrationCount > 0
          ? `${registrationCount} dossier${registrationCount > 1 ? "s" : ""} suivi${registrationCount > 1 ? "s" : ""}.`
          : "Aucune inscription suivie pour le moment.",
      href: "/user/inscriptions",
      icon: CalendarDays,
      metric: `${registrationCount}`,
      status:
        registrationCount > 0
          ? "Consultez vos joueurs, leurs tableaux et leur statut."
          : "Retrouvez ici vos inscriptions des que le premier dossier est cree.",
      cta: "Ouvrir les inscriptions",
    },
    {
      title: "Mes paiements",
      description:
        pendingPaymentCount > 0
          ? `${pendingPaymentCount} paiement${pendingPaymentCount > 1 ? "s" : ""} en attente.`
          : "Aucun paiement en attente.",
      href: "/user/paiements",
      icon: CreditCard,
      metric: `${pendingPaymentCount}`,
      status:
        pendingPaymentCount > 0
          ? "Suivez le reste a regler et l'etat des dossiers."
          : "Tous vos dossiers regles apparaissent ici comme soldes.",
      cta: "Voir mes paiements",
    },
    {
      title: "Mes documents",
      description: "0 document disponible pour le moment.",
      href: "/user/documents",
      icon: FileText,
      metric: "0",
      status:
        "La bibliotheque sera alimentee avec vos pieces et justificatifs utiles.",
      cta: "Ouvrir les documents",
    },
  ];
  const reservedRoleCards: ReservedRoleCard[] = [
    canAccessClub
      ? {
          title: "Espace club",
          description:
            "Ressources internes, annonces et raccourcis utiles a la vie du club.",
          href: "/user/club",
          icon: Building2,
          status: "Point d'entree commun pour les contenus internes du club.",
          cta: "Ouvrir l'espace club",
        }
      : null,
    canAccessBureau
      ? {
          title: "Espace bureau",
          description:
            "Pilotage des priorites, organisation et coordination du bureau.",
          href: "/user/bureau",
          icon: BriefcaseBusiness,
          status: "Concu pour les membres du bureau et les administrateurs.",
          cta: "Ouvrir l'espace bureau",
        }
      : null,
    canAccessEntraineur
      ? {
          title: "Espace entraineur",
          description:
            "Suivi sportif, groupes et ressources dediees a l'encadrement.",
          href: "/user/entraineur",
          icon: Dumbbell,
          status: "Reserve aux entraineurs et aux administrateurs.",
          cta: "Ouvrir l'espace entraineur",
        }
      : null,
  ].filter((space): space is ReservedRoleCard => space !== null);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Espace membre</h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez vos inscriptions, paiements, documents et notifications
            du club en un seul endroit.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="border-amber-300/70 bg-amber-300 text-amber-950 hover:bg-amber-300/90">
              Role: {roleLabel}
            </Badge>
            {canAccessClub ? (
              <Badge className="border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/20">
                Club
              </Badge>
            ) : null}
            {canAccessBureau ? (
              <Badge className="border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/20">
                Bureau
              </Badge>
            ) : null}
            {canAccessEntraineur ? (
              <Badge className="border-violet-300 bg-violet-100 text-violet-800 hover:bg-violet-200 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-200 dark:hover:bg-violet-500/20">
                Entraîneur
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/tournoi">Voir le tournoi</Link>
          </Button>
          <Button asChild>
            <Link href="/user/inscriptions">Voir mes inscriptions</Link>
          </Button>
        </div>
      </header>

      {forbiddenMessage ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {forbiddenMessage.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {forbiddenMessage.description}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!canAccessClub ? (
        <section className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Vous faites partie du club ?
              </p>
              <p className="text-sm text-muted-foreground">
                Vous pouvez demander le role Club pour acceder a l&apos;espace
                prive, aux annonces internes et aux documents reserves.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/club/contact">Demander l&apos;acces club</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card
              key={metric.label}
              className="border-border/70 bg-card/95 shadow-xs [background-image:none]"
            >
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-3xl font-semibold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground">{metric.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Notifications recentes</h2>
            <p className="text-sm text-muted-foreground">
              Les dernieres annonces, mises a jour et changements utiles pour
              votre espace.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/user/notifications">Voir tout l'historique</Link>
          </Button>
        </div>

        <UserNotificationsSection
          canMarkAsRead={Boolean(session?.user?.id)}
          notifications={notifications.map((notification) => ({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            href:
              notification.href ??
              getDefaultNotificationHref(session?.user?.role ?? null),
            isImportant:
              notification.priority === "HIGH" ||
              notification.priority === "URGENT",
            formattedDate: formatMessageDate(notification.publishedAt),
            authorName: notification.createdByUser?.name ?? null,
            authorEmail: notification.createdByUser?.email ?? null,
            isUnread:
              Boolean(session?.user?.id) && notification.reads.length === 0,
          }))}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Actions et outils</h2>
          <p className="text-sm text-muted-foreground">
            Accedez directement aux espaces utiles avec un contexte clair sur
            chaque dossier.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {actionCards.map((action) => {
            const Icon = action.icon;

            return (
              <Card
                key={action.href}
                className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {action.title}
                      </CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                    <div className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {action.metric}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {action.status}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="px-0">
                    <Link
                      href={action.href}
                      className="inline-flex items-center gap-2"
                    >
                      {action.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {reservedRoleCards.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Espaces reserves</h2>
            <p className="text-sm text-muted-foreground">
              Acces dedies a vos responsabilites internes au sein du club.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {reservedRoleCards.map((space) => {
              const Icon = space.icon;

              return (
                <Card
                  key={space.href}
                  className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
                >
                  <CardHeader className="space-y-3">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {space.title}
                      </CardTitle>
                      <CardDescription>{space.description}</CardDescription>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {space.status}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="ghost" className="px-0">
                      <Link
                        href={space.href}
                        className="inline-flex items-center gap-2"
                      >
                        {space.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Mon profil</h2>
          <p className="text-sm text-muted-foreground">
            Mettez a jour votre nom d&apos;affichage et verifiez les
            informations liees a votre compte.
          </p>
        </div>

        <ProfileClient />
      </section>
    </main>
  );
}

function formatMessageDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getForbiddenMessage(reason?: string) {
  switch (reason) {
    case "admin":
      return {
        title: "Acces reserve aux administrateurs.",
        description:
          "Vous avez ete redirige vers votre espace membre standard.",
      };
    case "club":
      return {
        title: "Acces reserve a l'espace club.",
        description:
          "Votre compte n'a pas encore les droits necessaires pour cette zone. Si vous faites partie du club, vous pouvez demander le role Club pour obtenir l'acces.",
      };
    case "bureau":
      return {
        title: "Acces reserve a l'espace bureau.",
        description:
          "Cette partie est destinee aux membres du bureau et aux administrateurs.",
      };
    case "entraineur":
      return {
        title: "Acces reserve a l'espace entraineur.",
        description:
          "Cette partie est destinee aux entraineurs et aux administrateurs.",
      };
    default:
      return null;
  }
}
