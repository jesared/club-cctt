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
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  href: string;
  icon: LucideIcon;
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
      helper: "dossiers suivis",
      icon: CalendarDays,
    },
    {
      label: "À régler",
      value: pendingPaymentCount,
      helper: "paiements en attente",
      icon: CreditCard,
    },
    {
      label: "Non lus",
      value: unreadNotificationCount,
      helper: "notifications à consulter",
      icon: BellRing,
    },
  ];
  const actionCards = [
    {
      title: "Mes inscriptions",
      description:
        registrationCount > 0
          ? `${registrationCount} dossier${registrationCount > 1 ? "s" : ""} suivi${registrationCount > 1 ? "s" : ""}`
          : "Aucune inscription suivie",
      href: "/user/inscriptions",
      icon: CalendarDays,
    },
    {
      title: "Mes paiements",
      description:
        pendingPaymentCount > 0
          ? `${pendingPaymentCount} paiement${pendingPaymentCount > 1 ? "s" : ""} en attente`
          : "Aucun paiement en attente",
      href: "/user/paiements",
      icon: CreditCard,
    },
    {
      title: "Mes documents",
      description: "Pièces et justificatifs utiles",
      href: "/user/documents",
      icon: FileText,
    },
  ];
  const reservedRoleCards: ReservedRoleCard[] = [
    canAccessClub
      ? {
          title: "Espace club",
          href: "/user/club",
          icon: Building2,
        }
      : null,
    canAccessBureau
      ? {
          title: "Espace bureau",
          href: "/user/bureau",
          icon: BriefcaseBusiness,
        }
      : null,
    canAccessEntraineur
      ? {
          title: "Espace entraîneur",
          href: "/user/entraineur",
          icon: Dumbbell,
        }
      : null,
  ].filter((space): space is ReservedRoleCard => space !== null);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <header>
        <div>
          <h1 className="text-2xl font-semibold">Espace membre</h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez vos inscriptions, paiements, documents et notifications
            du club en un seul endroit.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="border-amber-300/70 bg-amber-300 text-amber-950 hover:bg-amber-300/90">
              Rôle : {roleLabel}
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
                Vous pouvez demander le rôle Club pour accéder à l&apos;espace
                privé, aux annonces internes et aux documents réservés.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/club/contact">Demander l&apos;accès club</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {dashboardMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card
              key={metric.label}
              className="border-border/70 bg-card/95 shadow-xs [background-image:none]"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-2xl font-semibold text-foreground">
                      {metric.value}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {metric.helper}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Notifications récentes</h2>
              <p className="text-sm text-muted-foreground">
                Les dernières informations utiles du club.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/user/notifications">Voir l&apos;historique</Link>
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
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Accès rapides</h2>
            <p className="text-sm text-muted-foreground">
              Vos pages les plus utiles.
            </p>
          </div>
          <Card className="overflow-hidden border-border bg-card shadow-sm">
          {actionCards.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 border-b border-border/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {action.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
          </Card>
        </div>
      </section>

      {reservedRoleCards.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Espaces réservés</h2>
            <p className="text-sm text-muted-foreground">
              Accès liés à vos responsabilités dans le club.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {reservedRoleCards.map((space) => {
              const Icon = space.icon;

              return (
                <Link
                  key={space.href}
                  href={space.href}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs transition-colors hover:bg-muted/40"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="flex-1 text-sm font-medium text-foreground">
                    {space.title}
                  </p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Mon profil</h2>
          <p className="text-sm text-muted-foreground">
            Mettez à jour votre nom d&apos;affichage et vérifiez les
            informations liées à votre compte.
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
        title: "Accès réservé aux administrateurs.",
        description:
          "Vous avez été redirigé vers votre espace membre standard.",
      };
    case "club":
      return {
        title: "Accès réservé à l'espace club.",
        description:
          "Votre compte n'a pas encore les droits nécessaires pour cette zone. Si vous faites partie du club, vous pouvez demander le rôle Club pour obtenir l'accès.",
      };
    case "bureau":
      return {
        title: "Accès réservé à l'espace bureau.",
        description:
          "Cette partie est destinée aux membres du bureau et aux administrateurs.",
      };
    case "entraineur":
      return {
        title: "Accès réservé à l'espace entraîneur.",
        description:
          "Cette partie est destinée aux entraîneurs et aux administrateurs.",
      };
    default:
      return null;
  }
}
