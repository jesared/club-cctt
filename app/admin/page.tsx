import Link from "next/link";
import {
  ArrowRight,
  BadgeEuro,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  Handshake,
  Image as ImageIcon,
  LayoutGrid,
  Mail,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withNotificationSchemaFallback } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "A definir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminPage() {
  await requireAdminSession();

  const [
    totalUsers,
    totalMediaAssets,
    totalMessages,
    totalNotifications,
    publishedMessages,
    draftMessages,
    currentTournament,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.mediaAsset.count(),
    prisma.message.count(),
    withNotificationSchemaFallback(() => prisma.notification.count(), 0),
    prisma.message.count({ where: { status: "PUBLISHED" } }),
    prisma.message.count({ where: { status: "DRAFT" } }),
    prisma.tournament.findFirst({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        registrationOpenAt: true,
        registrationCloseAt: true,
        _count: {
          select: {
            registrations: true,
            events: true,
          },
        },
        registrations: {
          where: {
            status: "PENDING",
          },
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const tournamentPendingRegistrations =
    currentTournament?.registrations.length ?? 0;

  const focusCards = [
    {
      label: "Tournoi en cours",
      value: currentTournament?.name ?? "Aucun tournoi publie",
      detail: currentTournament
        ? `${currentTournament._count.events} tableau(x) et ${currentTournament._count.registrations} inscription(s).`
        : "Activez un tournoi pour alimenter le front public et les workflows.",
      Icon: Ticket,
    },
    {
      label: "Inscriptions a traiter",
      value: String(tournamentPendingRegistrations),
      detail: currentTournament
        ? "Demandes en attente de validation sur le tournoi publie."
        : "Aucun tournoi publie, donc aucune file de validation active.",
      Icon: CalendarClock,
    },
    {
      label: "Notifications",
      value: String(totalNotifications),
      detail: `${publishedMessages} message(s) publie(s) sur ${totalMessages} au total.`,
      Icon: BellRing,
    },
    {
      label: "Utilisateurs",
      value: String(totalUsers),
      detail: `${totalMediaAssets} media(s) stocke(s) dans la bibliotheque.`,
      Icon: Users,
    },
  ];

  const workspaceCards = [
    {
      title: "Pilotage tournoi",
      description:
        "Le coeur operationnel : inscriptions, paiements, pointages, exports et configuration.",
      href: "/admin/tournoi",
      tone: "border-primary/30 bg-primary/10",
      links: [
        {
          href: "/admin/tournoi/inscriptions",
          label: "Voir les inscriptions",
          helper: `${tournamentPendingRegistrations} en attente`,
        },
        {
          href: "/admin/tournoi/paiement",
          label: "Vérifier les paiements",
          helper: "Suivi des reglements",
        },
        {
          href: "/admin/tournoi/pointages",
          label: "Ouvrir les pointages",
          helper: "Contrôle salle et présence",
        },
      ],
      Icon: Ticket,
    },
    {
      title: "Contenus club",
      description:
        "Les zones qui changent le site public : accueil, menu, contact et media.",
      href: "/admin/home",
      tone: "border-border bg-card",
      links: [
        {
          href: "/admin/home",
          label: "Modifier la home",
          helper: "Hero, visuels et contenus",
        },
        {
          href: "/admin/menu",
          label: "Ajuster le menu",
          helper: "Navigation publique",
        },
        {
          href: "/admin/contact",
          label: "Mettre a jour le contact",
          helper: "Coordonnées et aide",
        },
        {
          href: "/admin/horaires",
          label: "Modifier les horaires",
          helper: "Jours, créneaux et badges",
        },
        {
          href: "/admin/tarifs",
          label: "Modifier les tarifs",
          helper: "Cotisations et paiement",
        },
        {
          href: "/admin/partenaires",
          label: "Modifier les partenaires",
          helper: "Logos, descriptions et liens",
        },
        {
          href: "/admin/comite-directeur",
          label: "Modifier le comite",
          helper: "Bureau, membres et photos",
        },
        {
          href: "/admin/salaries",
          label: "Modifier les salariés",
          helper: "Équipe salariée et portraits",
        },
      ],
      Icon: LayoutGrid,
    },
    {
      title: "Communication et contrôle",
      description:
        "Messages internes, notifications, acces utilisateurs, media et audit UX pour garder le site propre.",
      href: "/admin/notifications",
      tone: "border-border bg-card",
      links: [
        {
          href: "/admin/notifications",
          label: "Piloter les notifications",
          helper: `${totalNotifications} notification(s)`,
        },
        {
          href: "/admin/messages",
          label: "Gérer les messages",
          helper: `${draftMessages} brouillon(s)`,
        },
        {
          href: "/admin/users",
          label: "Voir les utilisateurs",
          helper: `${totalUsers} compte(s)`,
        },
        {
          href: "/admin/media",
          label: "Ouvrir la mediatheque",
          helper: `${totalMediaAssets} fichier(s)`,
        },
      ],
      Icon: ShieldCheck,
    },
  ];

  const quickLinks = [
    {
      href: "/admin/notifications",
      label: "Notifications",
      helper: "Cloche, historique et alertes auto",
      Icon: BellRing,
    },
    {
      href: "/admin/tournoi/edition",
      label: "Configurer le tournoi",
      helper: "Fiche et fenetre d'inscription",
      Icon: CalendarClock,
    },
    {
      href: "/admin/tournoi/exports",
      label: "Exports tournoi",
      helper: "Sorties CSV et feuilles de salle",
      Icon: FileText,
    },
    {
      href: "/admin/home",
      label: "Accueil public",
      helper: "Promesse, hero et tournoi",
      Icon: LayoutGrid,
    },
    {
      href: "/admin/contact",
      label: "Contact club",
      helper: "Coordonnées et disponibilites",
      Icon: Mail,
    },
    {
      href: "/admin/horaires",
      label: "Horaires club",
      helper: "Planning public et créneaux",
      Icon: CalendarClock,
    },
    {
      href: "/admin/tarifs",
      label: "Tarifs club",
      helper: "Cotisations et inscription",
      Icon: BadgeEuro,
    },
    {
      href: "/admin/partenaires",
      label: "Partenaires club",
      helper: "Sponsors et institutionnels",
      Icon: Handshake,
    },
    {
      href: "/admin/comite-directeur",
      label: "Comite directeur",
      helper: "Équipe dirigeante et portraits",
      Icon: Users,
    },
    {
      href: "/admin/salaries",
      label: "Salariés diplômés",
      helper: "Équipe salariée et portraits",
      Icon: BriefcaseBusiness,
    },
    {
      href: "/admin/menu",
      label: "Navigation",
      helper: "Liens et mise en avant",
      Icon: ArrowRight,
    },
    {
      href: "/admin/media",
      label: "Media",
      helper: "Images et ressources",
      Icon: ImageIcon,
    },
    {
      href: "/admin/users",
      label: "Utilisateurs",
      helper: "Roles et acces",
      Icon: Users,
    },
    {
      href: "/admin/documentation",
      label: "Documentation",
      helper: "Roles, acces et repères internes",
      Icon: FileText,
    },
    {
      href: "/admin/audit-ux",
      label: "Audit UX",
      helper: "Suivi des pistes d'amelioration",
      Icon: ShieldCheck,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-primary">
            Back-office central
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            Club + tournoi
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            Actions prioritaires visibles
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Administration
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Cette page sert maintenant de point d&apos;entree opératif : on y
            retrouve les zones importantes, les compteurs utiles et les acces
            rapides vers les taches les plus frequentes.
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {focusCards.map(({ label, value, detail, Icon }) => (
          <Card
            key={label}
            className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
          >
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </p>
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <CardTitle className="text-xl leading-snug">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {workspaceCards.map(({ title, description, href, links, tone, Icon }) => (
          <Card
            key={title}
            className={`border-border shadow-sm transition-colors duration-200 hover:shadow-md ${tone}`}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-full bg-background/80 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Link
                  href={href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:opacity-80"
                >
                  Ouvrir
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm transition hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.helper}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle>Acces rapides</CardTitle>
            <CardDescription>
              Les entrees les plus utiles quand on veut agir tout de suite.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map(({ href, label, helper, Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle>État du back-office</CardTitle>
            <CardDescription>
              Quelques repères pour savoir ou se trouve le prochain point
              d&apos;attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">Tournoi publie</p>
              <p className="mt-1 text-muted-foreground">
                {currentTournament?.name ?? "Aucun tournoi publie actuellement."}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">
                Ouverture des inscriptions
              </p>
              <p className="mt-1 text-muted-foreground">
                {formatDateTime(currentTournament?.registrationOpenAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">
                Fermeture des inscriptions
              </p>
              <p className="mt-1 text-muted-foreground">
                {formatDateTime(currentTournament?.registrationCloseAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="font-medium text-foreground">Periode du tournoi</p>
              <p className="mt-1 text-muted-foreground">
                {currentTournament
                  ? `${formatDateTime(currentTournament.startDate)} -> ${formatDateTime(currentTournament.endDate)}`
                  : "A definir"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
