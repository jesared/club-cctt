import Reveal from "@/components/Reveal";
import ClubContextNav from "@/components/public/club-context-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BadgeVariant, HorairesResponse } from "@/lib/horaires-content";
import Link from "next/link";

const profileCards = [
  {
    title: "Je cherche un creneau jeune",
    detail:
      "Reperez d'abord les badges Jeunes pour identifier les seances encadrees adaptees aux plus jeunes.",
    badge: "Jeunes",
  },
  {
    title: "Je veux jouer en loisir",
    detail:
      "Cherchez les creneaux Loisir pour une pratique detendue, reguliere ou orientee sport sante.",
    badge: "Loisir",
  },
  {
    title: "Je veux m'entrainer davantage",
    detail:
      "Combinez les creneaux Elite et Libre si vous cherchez plus de volume ou un niveau confirme.",
    badge: "Elite + Libre",
  },
];

const practicalNotes = [
  "Les horaires peuvent evoluer pendant les vacances scolaires et les jours feries.",
  "Le jeu libre est reserve aux licencies du club.",
  "Un premier essai est possible avant toute inscription.",
];

function getBadgeLabel(type: BadgeVariant) {
  if (type === "jeunes") {
    return "Jeunes";
  }

  if (type === "elite") {
    return "Elite";
  }

  if (type === "loisir") {
    return "Loisir";
  }

  return "Libre";
}

export default async function HorairesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/horaires`, {
    cache: "no-store",
  });

  const payload: HorairesResponse = await res.json();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <Reveal>
        <header className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-[#00D9FF]/40 bg-[#00D9FF]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[#00D9FF]">
            Horaires du club
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold">Horaires d&apos;entrainement</h1>
            {formattedUpdatedAt ? (
              <Badge variant={meta.stale ? "secondary" : "outline"}>
                {meta.stale
                  ? `Derniere mise a jour le ${formattedUpdatedAt}`
                  : `Mis a jour le ${formattedUpdatedAt}`}
              </Badge>
            ) : meta.stale ? (
              <Badge variant="secondary">
                Derniere mise a jour indisponible
              </Badge>
            ) : (
              <Badge variant="outline">Mise a jour en cours</Badge>
            )}
          </div>

          <div className="max-w-4xl space-y-3">
            <p className="text-lg text-foreground">
              Quel creneau pour quel public ?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cette page est pensee pour vous aider a trouver rapidement un
              rythme adapte : jeunes, loisir, entrainement soutenu ou jeu
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
            <Card className="border-border bg-card shadow-sm card-hover hover:border-[#00D9FF]/80">
              <CardHeader className="space-y-3">
                <div className="inline-flex w-fit rounded-full border border-[#00D9FF]/30 bg-[#00D9FF]/10 px-3 py-1 text-xs font-medium text-[#00D9FF]">
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
                  <Badge variant="jeunes">Jeunes</Badge>
                  <span>Entrainements encadres pour les jeunes</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="elite">Elite</Badge>
                  <span>Groupes a niveau confirme</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="loisir">Loisir</Badge>
                  <span>Pratique loisir et sport sante</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="libre">Libre</Badge>
                  <span>Jeu libre reserve aux licencies</span>
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
              <Card className="card-hover">
                <CardHeader className="space-y-2">
                  <CardTitle>{jour.jour}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {jour.seances.length} creneau
                    {jour.seances.length > 1 ? "x" : ""} disponible
                    {jour.seances.length > 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {jour.seances.map((seance, i) => (
                      <li
                        key={i}
                        className="rounded-2xl border border-border/70 bg-background/80 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {seance.type.map((type) => (
                            <Badge key={type} variant={type}>
                              {getBadgeLabel(type)}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-base font-medium text-foreground">
                          {seance.horaire}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {seance.label || "Creneau sans precision complementaire."}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <Card className="border-l-4 border-l-[#00D9FF] card-hover hover:border-[#00D9FF]/80">
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

        <Reveal delay={120}>
          <Card className="border-l-4 border-l-[#00D9FF] card-hover hover:border-[#00D9FF]/80">
            <CardHeader>
              <CardTitle>Essai gratuit</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Vous hesez encore entre plusieurs creneaux ? Le plus simple est
                de nous contacter pour un premier essai et un conseil adapte a
                votre profil.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/club/contact">Contacter le club</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/club/tarifs">Voir les tarifs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
