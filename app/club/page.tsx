import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* TITRE PAGE */}
      <header className="rounded-xl border bg-card/70 p-8 shadow-sm ">
        <p className="mb-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary dark:font-mono ">
          Club CCTT
        </p>
        <h1 className="text-4xl font-bold mb-4 ">Le Club</h1>
        <p className="text-muted-foreground max-w-3xl ">
          Découvrez le Châlons-en-Champagne Tennis de Table, ses valeurs et son
          engagement au service de la pratique du tennis de table.
        </p>
      </header>

      {/* PRÉSENTATION */}
      <section>
        <Card className="bg-muted/40 ">
          <CardHeader>
            <CardTitle>Présentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed max-w-4xl">
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
        <h2 className="text-2xl font-semibold mb-6 ">Nos valeurs</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {/* ACCESSIBILITÉ */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground ">
                Un club ouvert à tous les publics, quel que soit l’âge ou le
                niveau.
              </p>
            </CardContent>
          </Card>

          {/* CONVIVIALITÉ */}
          <Card>
            <CardHeader>
              <CardTitle>Convivialité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground ">
                Un esprit d’équipe et une ambiance conviviale au cœur du club.
              </p>
            </CardContent>
          </Card>

          {/* ENCADREMENT */}
          <Card>
            <CardHeader>
              <CardTitle>Encadrement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Des entraînements encadrés avec sérieux et pédagogie.
              </p>
            </CardContent>
          </Card>

          {/* RESPECT */}
          <Card>
            <CardHeader>
              <CardTitle>Respect & fair-play</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground ">
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
