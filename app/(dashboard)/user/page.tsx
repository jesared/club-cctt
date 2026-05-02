import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CreditCard,
  FileText,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./profile-client";
import UserMessagesSection from "./user-messages-section";

export default async function UserProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ forbidden?: string }>;
}) {
  const resolved = await searchParams;
  const showForbidden = resolved?.forbidden === "admin";
  const session = await getServerSession(authOptions);
  const registrationWhere = session?.user?.id
    ? {
        OR: [
          { userId: session.user.id },
          { player: { ownerId: session.user.id } },
        ],
      }
    : undefined;

  const [messages, unreadMessageCount, registrationCount, paymentRows] =
    await Promise.all([
      prisma.message.findMany({
        where: {
          status: "PUBLISHED",
        },
        orderBy: [{ important: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: {
          author: {
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
      session?.user?.id
        ? prisma.message.count({
            where: {
              reads: {
                none: {
                  userId: session.user.id,
                },
              },
            },
          })
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
      value: unreadMessageCount,
      helper: "annonces a consulter",
      icon: MessageSquare,
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
      description:
        "0 document disponible pour le moment.",
      href: "/user/documents",
      icon: FileText,
      metric: "0",
      status:
        "La bibliotheque sera alimentee avec vos pieces et justificatifs utiles.",
      cta: "Ouvrir les documents",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Espace membre</h1>
          <p className="text-sm text-muted-foreground">
            Retrouvez vos inscriptions, paiements, documents et informations du
            club en un seul endroit.
          </p>
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

      {showForbidden ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Acces reserve aux administrateurs.
              </p>
              <p className="text-sm text-muted-foreground">
                Vous avez ete redirige vers votre espace membre standard.
              </p>
            </div>
          </div>
        </div>
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
            <h2 className="text-xl font-semibold">Messages du club</h2>
            <p className="text-sm text-muted-foreground">
              Les informations importantes et les dernieres annonces du club.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/club/contact">Contacter le club</Link>
          </Button>
        </div>

        <UserMessagesSection
          canMarkAsRead={Boolean(session?.user?.id)}
          messages={messages.map((message) => ({
            id: message.id,
            title: message.title,
            content: message.content,
            important: message.important,
            formattedDate: formatMessageDate(message.createdAt),
            authorName: message.author.name,
            authorEmail: message.author.email,
            isUnread: Boolean(session?.user?.id) && message.reads.length === 0,
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
                <p className="text-sm text-muted-foreground">{action.status}</p>
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
