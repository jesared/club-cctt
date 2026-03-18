import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserParametresPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Paramètres</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les préférences de votre compte utilisateur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">Annuler</Button>
          <Button>Enregistrer</Button>
        </div>
      </header>

      <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
          <CardDescription>
            Configurez vos notifications et informations de profil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Le formulaire de paramètres sera intégré ici.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
