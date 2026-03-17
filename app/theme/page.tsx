import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tokenCards = [
  {
    name: "Primary",
    swatchClass: "bg-primary text-primary-foreground",
    textClass: "text-primary",
    borderClass: "border-primary/40",
  },
  {
    name: "Secondary",
    swatchClass: "bg-secondary text-secondary-foreground",
    textClass: "text-secondary-foreground",
    borderClass: "border-secondary",
  },
  {
    name: "Accent",
    swatchClass: "bg-accent text-accent-foreground",
    textClass: "text-accent-foreground",
    borderClass: "border-accent",
  },
  {
    name: "Destructive",
    swatchClass: "bg-destructive text-destructive-foreground",
    textClass: "text-destructive",
    borderClass: "border-destructive/40",
  },
];

export default function ThemePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Démonstration du thème</h1>
            <p className="text-sm text-muted-foreground">
              Cette page montre comment les tokens visuels (couleurs, surfaces,
              contrastes) s&apos;appliquent automatiquement en mode clair et
              sombre.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <span className="text-sm text-muted-foreground">Changer le mode</span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tokenCards.map((token) => (
          <Card key={token.name} className={token.borderClass}>
            <CardHeader>
              <CardTitle className="text-base">{token.name}</CardTitle>
              <CardDescription>Token de couleur du design system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={`rounded-md px-3 py-2 text-sm font-medium ${token.swatchClass}`}
              >
                Exemple de fond {token.name.toLowerCase()}
              </div>
              <p className={`text-sm ${token.textClass}`}>
                Ce texte utilise la teinte {token.name.toLowerCase()}.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Composants interactifs</CardTitle>
            <CardDescription>
              Les composants s&apos;adaptent sans modification de code selon le
              thème actif.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>Bouton principal</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statuts et badges</CardTitle>
            <CardDescription>
              Exemple d&apos;application sur des éléments de statut.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>Par défaut</Badge>
            <Badge variant="secondary">Information</Badge>
            <Badge variant="destructive">Urgent</Badge>
            <Badge variant="outline">Neutre</Badge>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
