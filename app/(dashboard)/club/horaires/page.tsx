import Link from "next/link";

import Reveal from "@/components/Reveal";
import ClubContextNav from "@/components/public/club-context-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ctaToneClasses } from "@/lib/cta-theme";
import type { BadgeVariant, HorairesResponse } from "@/lib/horaires-content";

const profileCards = [
  {
    title: "Je cherche un créneau jeune",
    detail:
      "Repérez d'abord les badges Jeunes pour identifier les séances encadrées adaptées aux plus jeunes.",
    badge: "Jeunes",
  },
  {
    title: "Je veux jouer en loisir",
    detail:
      "Cherchez les créneaux Loisir pour une pratique détendue, régulière ou orientée sport santé.",
    badge: "Loisir",
  },
  {
    title: "Je veux m'entraîner davantage",
    detail:
      "Combinez les créneaux Elite et Libre si vous cherchez plus de volume ou un niveau confirmé.",
    badge: "Elite + Libre",
  },
];

const practicalNotes = [
  "Les horaires peuvent évoluer pendant les vacances scolaires et les jours fériés.",
  "Le jeu libre est réservé aux licenciés du club.",
  "Un premier essai est possible avant toute inscription.",
];

function getBadgeLabel(type: BadgeVariant) {
  if (type === "jeunes") {
    return "Jeunes";
  }

  if (type === "adultes") {
    return "Adultes";
  }

  if (type === "elite") {
    return "Elite";
  }

  if (type === "loisir") {
    return "Loisir";
  }

  return "Libre";
}

function ScheduleBadge({ type }: { type: BadgeVariant }) {
  return (
    <Badge variant={type} className="h-6 rounded-full px-2.5">
      {getBadgeLabel(type)}
    </Badge>
  );
}

export default async function HorairesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/horaires`, {
    cache: "no-store",
  });

  const payload: HorairesResponse = await res.json();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <Reveal>
        <header className="space-y-6">
          <p className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] ${ctaToneClasses.schedule.eyebrow}`}>
            Horaires du club
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold">Horaires d&apos;entraînement</h1>
            {formattedUpdatedAt ? (
              <Badge variant={meta.stale ? "secondary" : "outline"}>
                {meta.stale
                  ? `Dernière mise à jour le ${formattedUpdatedAt}`
                  : `Mis à jour le ${formattedUpdatedAt}`}
              </Badge>
            ) : meta.stale ? (
              <Badge variant="secondary">
                Dernière mise à jour indisponible
              </Badge>
            ) : (
              <Badge variant="outline">Mise à jour en cours</Badge>
            )}
          </div>

          <div className="max-w-4xl space-y-3">
            <p className="text-lg text-foreground">Quel créneau pour quel public ?</p>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cette page est pensée pour vous aider à trouver rapidement un
              rythme adapté : jeunes, loisir, entraînement soutenu ou jeu
              libre. Commencez par le profil qui vous ressemble, puis regardez
              les jours correspondants.
            </p>
          </div>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <ClubContextNav />
      </Reveal>

      <section className="grid gap-4 lg:grid-cols-3">
        {profileCards.map((item, index) => (
          <Reveal key={item.title} delay={index * 100}>
            <Card className={`border-border bg-card shadow-sm card-hover ${ctaToneClasses.schedule.cardHover}`}>
              <CardHeader className="space-y-3">
                <div className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${ctaToneClasses.schedule.eyebrow}`}>
                  {item.badge}
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>

      <section className="space-y-8">
        <Reveal>
          <Card className="border-border/70 bg-muted/15 shadow-sm">
            <CardHeader>
              <CardTitle>Comment lire les badges</CardTitle>
            </CardHeader>

            <CardContent className="text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <ScheduleBadge type="jeunes" />
                  <span>Entraînements encadrés pour les jeunes</span>
                </div>

                <div className="flex items-center gap-2">
                  <ScheduleBadge type="adultes" />
                  <span>Créneaux pensés pour les joueurs et joueuses adultes</span>
                </div>

                <div className="flex items-center gap-2">
                  <ScheduleBadge type="elite" />
                  <span>Groupes à niveau confirmé</span>
                </div>

                <div className="flex items-center gap-2">
                  <ScheduleBadge type="loisir" />
                  <span>Pratique loisir et sport santé</span>
                </div>

                <div className="flex items-center gap-2">
                  <ScheduleBadge type="libre" />
                  <span>Jeu libre réservé aux licenciés</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <div className="md:columns-2 md:gap-6 xl:columns-3">
          {data.jours.map((jour, index) => (
            <Reveal
              key={jour.jour}
              delay={index * 120}
              className="mb-6 break-inside-avoid"
            >
              <Card className="overflow-hidden card-hover">
                <CardHeader className="border-b border-border/55 bg-muted/10">
                  <CardTitle>{jour.jour}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border/45">
                    {jour.seances.map((seance, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-[1rem_1fr] gap-3 bg-background/65 px-4 py-4 transition-colors hover:bg-muted/20"
                      >
                        <div
                          className="relative flex justify-center"
                          aria-hidden="true"
                        >
                          {i < jour.seances.length - 1 ? (
                            <span className="absolute top-5 h-[calc(100%+1.5rem)] w-px bg-border/70" />
                          ) : null}
                          <span className={`relative mt-1 size-2 rounded-full shadow-[0_0_0_4px_color-mix(in_oklch,var(--background)_76%,transparent)] ${ctaToneClasses.schedule.dot}`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <p className="text-lg font-semibold leading-none text-foreground">
                              {seance.horaire}
                            </p>
                            <div className="flex flex-wrap gap-1.5 sm:justify-end">
                              {seance.type.map((type) => (
                                <ScheduleBadge key={type} type={type} />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {seance.label || "Créneau sans précision complémentaire."}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="min-w-0">
          <Card className={`max-w-full border-l-4 border-cta-schedule card-hover ${ctaToneClasses.schedule.cardHover}`}>
            <CardHeader>
              <CardTitle>Ce qu&apos;il faut retenir avant de venir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {practicalNotes.map((note) => (
                <p key={note} className="text-sm text-muted-foreground">
                  {note}
                </p>
              ))}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={120} className="min-w-0">
          <Card className={`max-w-full border-l-4 border-cta-schedule card-hover ${ctaToneClasses.schedule.cardHover}`}>
            <CardHeader>
              <CardTitle>Essai gratuit</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Vous hésitez encore entre plusieurs créneaux ? Le plus simple est
                de nous contacter pour un premier essai et un conseil adapté à
                votre profil.
              </p>

              <ButtonGroup
                aria-label="Actions essai gratuit"
                className="w-full min-w-0 bg-transparent p-0 shadow-none sm:w-fit"
              >
                <Button
                  asChild
                  className={`h-10 min-w-0 flex-1 rounded-xl px-4 font-semibold sm:min-w-[12rem] ${ctaToneClasses.schedule.primaryButton}`}
                >
                  <Link href="/club/contact">Demander un essai</Link>
                </Button>
                <ButtonGroupSeparator className="mx-px hidden sm:block" />
                <Button
                  asChild
                  variant="ghost"
                  className={`h-10 min-w-0 flex-1 rounded-xl px-4 font-semibold sm:min-w-[12rem] ${ctaToneClasses.schedule.softButton}`}
                >
                  <Link href="/club/tarifs">Comparer les tarifs</Link>
                </Button>
              </ButtonGroup>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
