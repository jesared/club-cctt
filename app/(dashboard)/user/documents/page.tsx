import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserDocumentsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes documents</h1>
          <p className="text-sm text-muted-foreground">
            Centralisez vos justificatifs et documents utiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">Télécharger</Button>
          <Button>Ajouter</Button>
        </div>
      </header>

      <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Bibliothèque de documents</CardTitle>
          <CardDescription>
            Vos documents et justificatifs seront disponibles ici.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun document disponible pour le moment.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
