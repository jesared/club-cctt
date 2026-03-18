import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TournoiPalmaresPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Palmarès du tournoi</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Les palmarès du tournoi seront affichés ici.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground"></p>
        </CardContent>
      </Card>
    </main>
  );
}
