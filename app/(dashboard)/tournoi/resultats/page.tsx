import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Reveal from "@/components/Reveal";

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
            <CardTitle>Les résultats du tournoi seront publiés ici.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground"></p>
          </CardContent>
        </Card>
      </Reveal>
    </main>
  );
}
