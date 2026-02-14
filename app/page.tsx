import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TournoiHero from "@/components/TournoiHero";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-muted/40 dark:bg-[linear-gradient(160deg,color-mix(in_oklab,var(--background)_92%,black),color-mix(in_oklab,var(--background)_82%,var(--primary)))] dark:cyberpunk-home-grid">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:font-mono dark:uppercase dark:tracking-[0.08em] dark:[text-shadow:0_0_14px_color-mix(in_oklab,var(--primary)_38%,transparent)]">
              Châlons-en-Champagne
              <br />
              Tennis de Table
            </h1>

            <p className="text-lg text-muted-foreground mb-8 dark:text-foreground/85 dark:max-w-2xl">
              Club de tennis de table à Châlons-en-Champagne – loisirs et
              compétition, jeunes et adultes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/horaires"
                className="inline-flex justify-center rounded-md bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700 dark:rounded-none dark:border dark:border-primary/70 dark:bg-primary dark:px-7 dark:font-mono dark:uppercase dark:tracking-[0.12em] dark:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_42%,transparent)] dark:hover:translate-y-[-1px] dark:hover:bg-[color-mix(in_oklab,var(--primary)_88%,white)]"
              >
                Voir les horaires
              </a>

              <a
                href="/contact"
                className="inline-flex justify-center rounded-md border border-purple-600 px-6 py-3 text-purple-600 transition hover:bg-muted/40 dark:rounded-none dark:border-accent dark:px-7 dark:font-mono dark:uppercase dark:tracking-[0.12em] dark:text-accent dark:hover:bg-accent/10"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRÉSENTATION */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Bienvenue au CCTT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-muted-foreground leading-relaxed mb-6">
              Le <strong>Châlons-en-Champagne Tennis de Table (CCTT)</strong>{" "}
              accueille joueurs débutants comme confirmés dans un cadre
              convivial et structuré. Que vous souhaitiez pratiquer le tennis de
              table en loisir ou en compétition, notre club propose des
              entraînements adaptés à tous les niveaux et à tous les âges.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Encadré par un équipe d&apos;entraineurs professionnels diplômés,
              le club met l’accent sur la progression, le respect et le plaisir
              du jeu.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* MISE EN VALEUR */}
      <section className="bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-semibold mb-12 dark:font-mono dark:uppercase dark:tracking-[0.08em]">
            Le club en quelques mots
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>Tous les niveaux</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Enfants, adultes, débutants ou joueurs confirmés : chacun
                  trouve sa place au CCTT.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loisir & compétition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Une pratique adaptée à vos objectifs, du loisir à la
                  compétition officielle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Esprit club</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Convivialité, respect et engagement sont au cœur de la vie du
                  club.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* APPEL À L’ACTION */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="bg-purple-600 text-white dark:rounded-none dark:border dark:border-primary/70 dark:bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_86%,black),color-mix(in_oklab,var(--primary)_20%,var(--card)))] dark:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_25%,transparent)]">
            <CardHeader>
              <CardTitle className="text-white dark:font-mono dark:uppercase dark:tracking-[0.08em]">
                Envie de nous rejoindre ?
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              <p className="max-w-2xl">
                Venez essayer le tennis de table au sein du Châlons-en-Champagne
                Tennis de Table. Les essais sont possibles avant toute
                inscription.
              </p>

              <a
                href="/contact"
                className="inline-block rounded-md bg-background px-6 py-3 font-medium text-primary transition hover:bg-muted dark:rounded-none dark:border dark:border-accent/80 dark:bg-accent/95 dark:font-mono dark:uppercase dark:tracking-[0.1em] dark:text-accent-foreground dark:hover:bg-accent"
              >
                Nous contacter
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <h2 className="text-3xl font-semibold mb-12">Événement du club</h2>

          <TournoiHero />
        </div>
      </section>
    </>
  );
}
