import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Reveal from "@/components/Reveal";

const TOURNAMENT_2026_RESULTS_URL =
  "https://drive.google.com/drive/u/0/folders/1LBgasYtx4UkDSvjuvBu789wdRG_R6ODE";

export default function TournoiResultatsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Reveal>
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Résultats du tournoi</h1>
        </header>
      </Reveal>
      <Reveal>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Résultats du tournoi 2026</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="max-w-3xl text-sm text-muted-foreground">
              Les tableaux, classements et documents de l&apos;édition 2026
              sont disponibles dans le dossier officiel du tournoi.
            </p>
            <a
              href={TOURNAMENT_2026_RESULTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-ring"
            >
              Voir les résultats 2026
            </a>
          </CardContent>
        </Card>
      </Reveal>
    </main>
  );
}
