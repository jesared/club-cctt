import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Reveal from "@/components/Reveal";
import Link from "next/link";

export default function ClubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
      <Reveal>
        <header className="rounded-3xl border bg-gradient-to-br from-background via-background to-muted/60 p-6 sm:p-8 shadow-sm">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4 sm:space-y-5">
              <p className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary animate-fade-up-1">
                Club CCTT
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl animate-fade-up-2">
                Châlons-en-Champagne Tennis de Table
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base sm:text-lg animate-fade-up-2">
                Club de tennis de table à Châlons-en-Champagne : entraînements
                pour tous niveaux, loisirs et compétition, encadrés par une
                équipe passionnée.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 animate-fade-up-2">
                <Link
                  href="/club/horaires"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                >
                  Voir les horaires
                </Link>
                <Link
                  href="/club/tarifs"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Consulter les tarifs
                </Link>
                <Link
                  href="/club/contact"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Nous contacter
                </Link>
              </div>
            </div>

            <Card className="border-primary/30 bg-background/80 card-hover">
              <CardHeader>
                <CardTitle>En bref</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Loisir et compétition, enfants et adultes.</p>
                <p>Encadrement sérieux, progression garantie.</p>
                <p>Club affilié à la FFTT.</p>
              </CardContent>
            </Card>
          </div>
        </header>
      </Reveal>

      <Reveal>
        <section className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Horaires",
              description: "Tous les créneaux d’entraînement à jour.",
              href: "/club/horaires",
              label: "Voir les horaires",
            },
            {
              title: "Tarifs",
              description: "Formules selon l’âge et le niveau.",
              href: "/club/tarifs",
              label: "Voir les tarifs",
            },
            {
              title: "Comité",
              description: "L’équipe qui fait vivre le club.",
              href: "/club/comite-directeur",
              label: "Découvrir le comité",
            },
            {
              title: "Partenaires",
              description: "Un réseau local engagé.",
              href: "/club/partenaires",
              label: "Voir les partenaires",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <Card className="bg-muted/30 card-hover">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <Link href={item.href} className="text-sm text-primary">
                    {item.label}
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Card className="bg-muted/40 card-hover">
            <CardHeader>
              <CardTitle>Présentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed max-w-4xl">
                Le CCTT est un club de tennis de table à Châlons-en-Champagne,
                affilié à la Fédération Française de Tennis de Table. Nous
                proposons des séances pour débutants, loisirs et compétiteurs,
                avec un accompagnement adapté à chaque profil.
              </p>
            </CardContent>
          </Card>
        </section>
      </Reveal>

      <section>
        <Reveal>
          <h2 className="text-2xl font-semibold mb-6">Nos valeurs</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Accessibilité",
              description: "Accueil de tous les âges et niveaux.",
            },
            {
              title: "Convivialité",
              description: "Ambiance chaleureuse et esprit d’équipe.",
            },
            {
              title: "Encadrement",
              description: "Séances structurées et pédagogiques.",
            },
            {
              title: "Respect & fair-play",
              description: "Valeurs sportives au quotidien.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-primary/20 card-hover">
            <CardHeader>
              <CardTitle>Contact & accès</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Besoin d’un essai gratuit ou d’une info rapide ?</p>
              <p>Écrivez-nous, on vous répond vite.</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Link
                  href="/club/contact"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Page contact
                </Link>
                <Link
                  href="/club/horaires"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Créneaux disponibles
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground card-hover">
            <CardHeader>
              <CardTitle>Rejoindre le club</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-primary-foreground/90">
                Lancez votre inscription ou venez faire un essai.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Link
                  href="/club/tarifs"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-background px-4 py-2 text-sm text-foreground hover:opacity-90"
                >
                  Voir les tarifs
                </Link>
                <Link
                  href="/club/contact"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-primary-foreground/40 px-4 py-2 text-sm hover:bg-primary-foreground/10"
                >
                  Demander un essai
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </Reveal>
    </div>
  );
}
