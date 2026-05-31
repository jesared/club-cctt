import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Dumbbell,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminSession } from "@/lib/session";

const roles = [
  {
    key: "USER",
    title: "Membre",
    badgeLabel: "Membre",
    Icon: User,
    badgeClassName:
      "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-400/40 dark:bg-slate-500/15 dark:text-slate-200 dark:hover:bg-slate-500/20",
    summary: "Rôle par défaut pour un compte standard.",
    accesses: ["Mon profil", "Mes inscriptions", "Mes paiements", "Mes documents"],
    limits: "Pas d'accès aux espaces club, bureau, entraîneur ou administration.",
  },
  {
    key: "CLUB",
    title: "Club",
    badgeLabel: "Club",
    Icon: Building2,
    badgeClassName:
      "border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/20",
    summary: "Pour les personnes qui doivent consulter les ressources internes du club.",
    accesses: [
      "Tout l'espace membre",
      "Espace club",
      "Annonces club",
      "Documents club",
      "Agenda club",
      "Contacts club",
    ],
    limits: "Pas d'accès à l'espace bureau, à l'espace entraîneur, ni au back-office admin.",
  },
  {
    key: "BUREAU",
    title: "Bureau",
    badgeLabel: "Bureau",
    Icon: BriefcaseBusiness,
    badgeClassName:
      "border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/20",
    summary: "Pour les membres du bureau qui pilotent la vie du club.",
    accesses: ["Accès CLUB inclus", "Espace bureau", "Réunions bureau", "Documents bureau"],
    limits: "Pas d'accès au back-office admin. Le rôle bureau garde aussi l'accès à l'espace club.",
  },
  {
    key: "ENTRAINEUR",
    title: "Entraîneur",
    badgeLabel: "Entraîneur",
    Icon: Dumbbell,
    badgeClassName:
      "border-violet-300 bg-violet-100 text-violet-800 hover:bg-violet-200 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-200 dark:hover:bg-violet-500/20",
    summary: "Pour l'encadrement sportif et le suivi des joueurs.",
    accesses: ["Accès CLUB inclus", "Espace entraîneur", "Joueurs", "Groupes", "Documents entraîneur"],
    limits: "Pas d'accès au back-office admin. Le rôle entraîneur garde aussi l'accès à l'espace club.",
  },
  {
    key: "ADMIN",
    title: "Administrateur",
    badgeLabel: "Admin",
    Icon: ShieldCheck,
    badgeClassName:
      "border-amber-300/70 bg-amber-300 text-amber-950 hover:bg-amber-300/90",
    summary: "Rôle complet pour gérer le site, les contenus et le tournoi.",
    accesses: [
      "Tous les espaces membres",
      "Tout /admin",
      "Administration tournoi",
      "Gestion des utilisateurs et des contenus",
    ],
    limits: "Les comptes admin sont protégés dans la page utilisateurs : ils ne peuvent pas être modifiés ou supprimés depuis cette interface.",
  },
];

const reminders = [
  "Les rôles se modifient dans /admin/users.",
  "Un seul rôle est attribué par compte, mais certains rôles ouvrent plusieurs espaces.",
  "BUREAU et ENTRAINEUR conservent l'accès à l'espace club.",
  "ADMIN ouvre tous les espaces membres en plus du back-office.",
];

export default async function AdminDocumentationPage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
        <CardHeader className="gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Documentation admin
            </p>
            <CardTitle className="text-3xl">Rôles et accès</CardTitle>
          </div>
          <CardDescription className="max-w-3xl text-sm leading-6">
            Cette première documentation explique les rôles disponibles dans le
            site, les espaces qu&apos;ils ouvrent et les limites à garder en
            tête quand on gère les comptes.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map(
          ({ key, title, badgeLabel, Icon, badgeClassName, summary, accesses, limits }) => (
          <Card key={key} className="border-border/70 bg-card shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <Badge className={`rounded-full px-2.5 py-1 ${badgeClassName}`}>
                  {badgeLabel}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-6">
                {summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Accès ouverts
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {accesses.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Point d'attention
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{limits}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <Card className="border-border/70 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <CardTitle>Lecture rapide</CardTitle>
                <CardDescription>
                  Résumé pratique pour attribuer le bon rôle sans ambiguïté.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {reminders.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <CardTitle>Pour agir tout de suite</CardTitle>
                <CardDescription>
                  Les pages utiles pour vérifier ou ajuster les droits.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm transition hover:bg-muted/40"
            >
              <div>
                <p className="font-medium text-foreground">Gestion utilisateurs</p>
                <p className="text-muted-foreground">
                  Modifier les rôles et vérifier les comptes.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>

            <Link
              href="/admin"
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm transition hover:bg-muted/40"
            >
              <div>
                <p className="font-medium text-foreground">Retour à l'accueil admin</p>
                <p className="text-muted-foreground">
                  Revenir au tableau de bord principal.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
