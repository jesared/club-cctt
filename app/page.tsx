import Link from "next/link";

import TournoiHero from "@/components/TournoiHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold">Châlons-en-Champagne Tennis de Table</h1>
          <p className="text-sm text-muted-foreground">
            Club de tennis de table à Châlons-en-Champagne – loisirs et compétition, jeunes et adultes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/horaires">Voir les horaires</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Bienvenue au CCTT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le <strong>Châlons-en-Champagne Tennis de Table (CCTT)</strong> accueille joueurs débutants
              comme confirmés dans un cadre convivial et structuré.
            </p>
            <p className="text-sm text-muted-foreground">
              Encadré par une équipe d&apos;entraineurs diplômés, le club met l’accent sur la progression,
              le respect et le plaisir du jeu.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold">Le club en quelques mots</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ["Tous les niveaux", "Enfants, adultes, débutants ou joueurs confirmés : chacun trouve sa place au CCTT."],
            ["Loisir & compétition", "Une pratique adaptée à vos objectifs, du loisir à la compétition officielle."],
            ["Esprit club", "Convivialité, respect et engagement sont au cœur de la vie du club."],
          ].map(([title, description]) => (
            <Card key={title} className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Envie de nous rejoindre ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Venez essayer le tennis de table au sein du club. Les essais sont possibles avant toute
              inscription.
            </p>
            <Button asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold">Événement du club</h2>
        <div className="mt-6">
          <TournoiHero />
        </div>
      </section>
    </div>
  );
}
