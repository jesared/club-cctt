import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ClubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
      <header className="rounded-3xl border bg-gradient-to-br from-background via-background to-muted/60 p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4 sm:space-y-5">
            <p className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Club CCTT
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Châlons-en-Champagne Tennis de Table
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
              Club de tennis de table à Châlons-en-Champagne : entraînements pour
              tous niveaux, loisirs et compétition, encadrés par une équipe
              passionnée.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
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

          <Card className="border-primary/30 bg-background/80">
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

      <section className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Horaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tous les créneaux d’entraînement à jour.
            </p>
            <Link href="/club/horaires" className="text-sm text-primary">
              Voir les horaires
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Tarifs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Formules selon l’âge et le niveau.
            </p>
            <Link href="/club/tarifs" className="text-sm text-primary">
              Voir les tarifs
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Comité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              L’équipe qui fait vivre le club.
            </p>
            <Link href="/club/comite-directeur" className="text-sm text-primary">
              Découvrir le comité
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Partenaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Un réseau local engagé.
            </p>
            <Link href="/club/partenaires" className="text-sm text-primary">
              Voir les partenaires
            </Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-muted/40">
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

      <section>
        <h2 className="text-2xl font-semibold mb-6">Nos valeurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accueil de tous les âges et niveaux.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Convivialité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ambiance chaleureuse et esprit d’équipe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Encadrement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Séances structurées et pédagogiques.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Respect & fair-play</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Valeurs sportives au quotidien.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20">
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

        <Card className="bg-primary text-primary-foreground">
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
    </div>
  );
}
