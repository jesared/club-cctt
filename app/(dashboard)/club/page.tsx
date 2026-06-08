import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Le club CCTT - Horaires, tarifs et contact",
  description:
    "Découvrez le club CCTT à Châlons-en-Champagne : horaires, tarifs, comité, partenaires et contact.",
  openGraph: {
    title: "Le club CCTT - Horaires, tarifs et contact",
    description:
      "Infos club CCTT : horaires, tarifs, comité directeur, partenaires et contact.",
    url: "/club",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 512,
        height: 512,
        alt: "Logo CCTT",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Le club CCTT - Horaires, tarifs et contact",
    description:
      "Infos club CCTT : horaires, tarifs, comité directeur, partenaires et contact.",
    images: ["/logo.jpg"],
  },
};

const quickStartCards = [
  {
    title: "Trouver un créneau",
    description:
      "Repérez rapidement les séances jeunes, loisir, entraînement soutenu ou jeu libre.",
    href: "/club/horaires",
    label: "Voir les horaires",
  },
  {
    title: "Comprendre les tarifs",
    description:
      "Comparez les formules, ce qui est inclus et les modalités de paiement avant de vous lancer.",
    href: "/club/tarifs",
    label: "Voir les tarifs",
  },
  {
    title: "Faire un essai",
    description:
      "Le plus simple est de nous contacter pour être orienté vers le bon créneau et le bon interlocuteur.",
    href: "/club/contact",
    label: "Contacter le club",
  },
];

const clubPillars = [
  {
    label: "Accueil",
    value: "Le club reste lisible pour débuter, reprendre ou venir essayer sans stress.",
  },
  {
    label: "Progression",
    value: "Jeunes, loisir et compétition trouvent chacun un cadre adapté.",
  },
  {
    label: "Vie de club",
    value: "Une pratique régulière, renforcée par une vie associative active.",
  },
];

const values = [
  "Accessibilité pour tous les âges et niveaux",
  "Convivialité et esprit d'équipe",
  "Encadrement structuré et pédagogique",
  "Respect et fair-play au quotidien",
];

const clubSections = [
  {
    title: "Comité directeur",
    description: "Rencontrer l'équipe dirigeante élue du club.",
    href: "/club/comite-directeur",
    label: "Voir le comité",
  },
  {
    title: "Salariés diplômés",
    description: "Découvrir l'équipe salariée qui accompagne la pratique.",
    href: "/club/salaries",
    label: "Voir les salariés",
  },
  {
    title: "Partenaires",
    description: "Découvrir les soutiens qui accompagnent le projet du club.",
    href: "/club/partenaires",
    label: "Voir les partenaires",
  },
];

export default function ClubPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-12">
      <Reveal>
        <header className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center rounded-full border border-[#2F6BFF]/40 bg-[#2F6BFF]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#2F6BFF] animate-fade-up-1">
                Club CCTT
              </p>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl animate-fade-up-2">
                  Châlons-en-Champagne Tennis de Table
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg animate-fade-up-2">
                  Retrouvez ici l&apos;essentiel pour rejoindre le club, comprendre
                  son fonctionnement et trouver rapidement la bonne page selon
                  votre besoin.
                </p>
              </div>

              <div
                className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-muted/30 p-1 sm:w-fit sm:flex-row"
                role="group"
                aria-label="Actions club"
              >
                <Button asChild className="h-10 rounded-md shadow-none">
                  <Link href="/club/horaires">Voir les horaires</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 rounded-md shadow-none"
                >
                  <Link href="/club/tarifs">Voir les tarifs</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 rounded-md shadow-none"
                >
                  <Link href="/club/contact">Contacter le club</Link>
                </Button>
              </div>
            </div>

            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div
                className="h-full min-h-[220px] bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                style={{
                  backgroundImage:
                    "url(https://res.cloudinary.com/diimhrbx7/image/upload/v1774953003/481667842_663772202843768_4729083360154549573_n_ff3jkc.jpg)",
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </header>
      </Reveal>

      <section className="space-y-5">
        <Reveal>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Accès rapides
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Le plus simple est de partir de votre besoin immédiat : trouver un
              créneau, comprendre les tarifs ou prendre contact pour un essai.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {quickStartCards.map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <Card className="flex h-full flex-col bg-muted/30 card-hover hover:border-[#2F6BFF]/80">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto border-t border-border/45 pt-4">
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[#2F6BFF]"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <Card className="bg-muted/40 card-hover hover:border-[#2F6BFF]/80">
            <CardHeader>
              <CardTitle>Le club en bref</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="max-w-4xl leading-relaxed text-muted-foreground">
                Le CCTT est un club de tennis de table à Châlons-en-Champagne,
                affilié à la{" "}
                <a
                  href="https://www.fftt.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Fédération Française de Tennis de Table
                </a>{" "}
                et également au{" "}
                <a
                  href="https://tthandisport.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Tennis de Table Handisport
                </a>
                {"."} Nous proposons des séances pour débutants, loisirs et
                compétiteurs, avec un accompagnement adapté à chaque profil.
              </p>

              <div className="grid gap-5 border-t border-border/45 pt-5 sm:grid-cols-3">
                {clubPillars.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold leading-snug text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border/45 pt-5">
                {values.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <div className="grid gap-4">
          {clubSections.map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <Card className="flex h-full flex-col card-hover hover:border-[#2F6BFF]/80">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto border-t border-border/45 pt-4">
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[#2F6BFF]"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section>
          <Card className="border-primary/20 card-hover">
            <CardHeader>
              <CardTitle>Besoin d&apos;être orienté ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Vous hésitez entre plusieurs créneaux ou plusieurs formules ? Le
                plus simple reste de nous contacter pour un conseil rapide ou un
                premier essai.
              </p>
              <div
                className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-background/70 p-1 sm:w-fit sm:flex-row"
                role="group"
                aria-label="Actions d'orientation"
              >
                <Button asChild className="h-10 rounded-md shadow-none">
                  <Link href="/club/contact">Contacter le club</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 rounded-md shadow-none"
                >
                  <Link href="/club/horaires">Voir les horaires</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 rounded-md shadow-none"
                >
                  <Link href="/club/tarifs">Voir les tarifs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </Reveal>
    </div>
  );
}
