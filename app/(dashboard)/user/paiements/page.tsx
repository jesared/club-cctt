import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserPaiementsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes paiements</h1>
          <p className="text-sm text-muted-foreground">
            Visualisez vos transactions et les montants en attente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">Exporter</Button>
          <Button>Payer</Button>
        </div>
      </header>

      <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Historique de paiement</CardTitle>
          <CardDescription>
            Le suivi détaillé de vos paiements sera affiché ici.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune transaction disponible pour le moment.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
