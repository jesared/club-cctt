import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TournoiAffichesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Affiches du tournoi</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Les affiches du tournoi seront affichées ici.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground"></p>
        </CardContent>
      </Card>
    </main>
  );
}
