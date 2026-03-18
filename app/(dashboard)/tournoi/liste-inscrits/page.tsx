import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ListeInscritsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Liste des inscrits</h1>
      </header>
      <Card>
        <CardHeader className="space-y-3">
          <p className="text-muted-foreground">
            La liste publique des inscrits sera publiée ici après validation des
            engagements.
          </p>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </main>
  );
}
