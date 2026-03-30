import Link from "next/link";

import Reveal from "@/components/Reveal";
import TournoiHero from "@/components/TournoiHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 animate-fade-soft">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold animate-fade-up-1">
            Châlons-en-Champagne Tennis de Table
          </h1>
          <p className="text-sm text-muted-foreground animate-fade-up-2">
            Club de tennis de table à Châlons-en-Champagne – loisirs et
            compétition, jeunes et adultes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap animate-fade-up-2">
            <Button
              asChild
              className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
            >
              <Link href="/club/horaires">Voir les horaires</Link>
            </Button>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="py-4">
          <Card className="border-0 bg-primary/5 card-hover">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Bienvenue au CCTT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Le <strong>Châlons-en-Champagne Tennis de Table (CCTT)</strong>
                accueille joueurs débutants comme confirmés dans un cadre
                convivial et structuré.
              </p>
              <p className="text-sm text-muted-foreground">
                Encadré par une équipe d&apos;entraîneurs diplômés, le club met
                l&apos;accent sur la progression, le respect et le plaisir du jeu.
              </p>
            </CardContent>
          </Card>
        </section>
      </Reveal>

      <section className="py-4">
        <Reveal>
          <h2 className="text-3xl font-bold">Le club en quelques mots</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            [
              "Tous les niveaux",
              "Enfants, adultes, débutants ou joueurs confirmés : chacun trouve sa place au CCTT.",
            ],
            [
              "Loisir & compétition",
              "Une pratique adaptée à vos objectifs, du loisir à la compétition officielle.",
            ],
            [
              "Esprit club",
              "Convivialité, respect et engagement sont au cœur de la vie du club.",
            ],
          ].map(([title, description], index) => (
            <Reveal key={title} delay={index * 120}>
              <Card className="p-6 card-hover">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="py-8">
          <Card className="border-primary/30 bg-primary/5 card-hover">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Envie de nous rejoindre ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Venez essayer le tennis de table au sein du club. Les essais sont
                possibles avant toute inscription.
              </p>
              <Button asChild>
                <Link href="/club/contact">Nous contacter</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </Reveal>

      <section>
        <Reveal>
          <h2 className="text-3xl font-bold">Événement du club</h2>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-6">
            <TournoiHero />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
