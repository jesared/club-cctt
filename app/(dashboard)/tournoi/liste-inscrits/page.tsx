import TrackedLink from "@/components/TrackedLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LISTE_OFFICIELLE_URL = "https://tournoi.cctt.fr/liste-des-inscrits/";

const pointsForts = [
  {
    title: "Publication officielle",
    description:
      "La source de référence reste la plateforme tournoi.cctt.fr, mise à jour par l'équipe d'organisation.",
  },
  {
    title: "Consultation rapide",
    description:
      "Affichage intégré ci-dessous pour éviter d'ouvrir un nouvel onglet quand vous êtes déjà sur le site du club.",
  },
  {
    title: "Version mobile",
    description:
      "Sur smartphone, utilisez le bouton d'accès direct si l'intégration est moins lisible selon votre navigateur.",
  },
];

export default function ListeInscritsPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <header className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          Tournoi CCTT 2026
        </Badge>
        <h1 className="text-2xl font-semibold md:text-3xl">Liste des inscrits</h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          Retrouvez la liste officielle des engagés sur chaque tableau, avec un
          accès direct à la version publique de référence.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {pointsForts.map((point) => (
          <Card key={point.title} className="border-border/70 bg-card/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{point.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl">Consultation en direct</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Si le contenu ne s&apos;affiche pas dans votre navigateur, ouvrez la
              page officielle dans un nouvel onglet.
            </p>
          </div>
          <TrackedLink
            kpiPage="tournoi"
            kpiLabel="liste-inscrits-externe"
            href={LISTE_OFFICIELLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Ouvrir la liste officielle
          </TrackedLink>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border/70 bg-background">
            <iframe
              title="Liste officielle des inscrits du tournoi"
              src={LISTE_OFFICIELLE_URL}
              className="h-[900px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
