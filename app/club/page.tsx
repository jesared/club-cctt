import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header className="rounded-xl border bg-card/70 p-8 shadow-sm dark:rounded-none dark:border-primary/40 dark:bg-[linear-gradient(155deg,color-mix(in_oklab,var(--card)_90%,black),color-mix(in_oklab,var(--primary)_16%,var(--card)))] dark:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
        <p className="mb-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary dark:font-mono dark:text-accent">
          Club CCTT
        </p>
        <h1 className="text-4xl font-bold mb-4 dark:font-mono dark:uppercase dark:tracking-[0.08em]">Le Club</h1>
        <p className="text-gray-600 max-w-3xl dark:text-foreground/80">
          Découvrez le Châlons-en-Champagne Tennis de Table, ses valeurs et son
          engagement au service de la pratique du tennis de table.
        </p>
      </header>

      {/* PRÉSENTATION */}
      <section>
        <Card className="bg-purple-50 cyberpunk-highlight dark:rounded-none dark:border-primary/50 dark:bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_90%,black),color-mix(in_oklab,var(--primary)_14%,var(--card)))]">
          <CardHeader>
            <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.08em]">Présentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed max-w-4xl cyberpunk-text-soft">
              Fondé à Châlons-en-Champagne, le <strong>CCTT</strong> est un club
              affilié à la Fédération Française de Tennis de Table. Le club a
              pour objectif de promouvoir la pratique du tennis de table, aussi
              bien en loisir qu’en compétition, dans un esprit de respect, de
              convivialité et de progression.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* VALEURS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8 dark:font-mono dark:uppercase dark:tracking-[0.08em]">Nos valeurs</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {/* ACCESSIBILITÉ */}
          <Card className="dark:rounded-none dark:border-primary/45 dark:bg-card/90 dark:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-foreground/75">
                Un club ouvert à tous les publics, quel que soit l’âge ou le
                niveau.
              </p>
            </CardContent>
          </Card>

          {/* CONVIVIALITÉ */}
          <Card className="dark:rounded-none dark:border-primary/45 dark:bg-card/90 dark:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
            <CardHeader>
              <CardTitle>Convivialité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-foreground/75">
                Un esprit d’équipe et une ambiance conviviale au cœur du club.
              </p>
            </CardContent>
          </Card>

          {/* ENCADREMENT */}
          <Card className="dark:rounded-none dark:border-primary/45 dark:bg-card/90 dark:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
            <CardHeader>
              <CardTitle>Encadrement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-foreground/75">
                Des entraînements encadrés avec sérieux et pédagogie.
              </p>
            </CardContent>
          </Card>

          {/* RESPECT */}
          <Card className="dark:rounded-none dark:border-primary/45 dark:bg-card/90 dark:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
            <CardHeader>
              <CardTitle>Respect & fair-play</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-foreground/75">
                Des valeurs sportives essentielles dans la pratique et la
                compétition.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
