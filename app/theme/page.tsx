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

const usageExamples = [
  {
    title: "Surfaces",
    description:
      "Utiliser bg-background pour la page, bg-card pour les blocs de contenu, et border-border pour garder une hiérarchie lisible.",
  },
  {
    title: "Texte",
    description:
      "text-foreground pour le texte principal et text-muted-foreground pour les compléments permet de maintenir un contraste cohérent.",
  },
  {
    title: "Actions",
    description:
      "Le bouton principal doit rester réservé aux actions critiques du parcours. Les variantes secondary/outline/ghost servent à réduire la charge visuelle.",
  },
  {
    title: "Feedback",
    description:
      "Accent met en valeur des états positifs et destructive les alertes. Éviter d'utiliser ces teintes pour du contenu purement décoratif.",
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Guide d&apos;utilisation</CardTitle>
            <CardDescription>
              Quelques règles simples pour appliquer le thème de façon uniforme
              dans l&apos;application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageExamples.map((item) => (
              <div key={item.title} className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiérarchie typographique</CardTitle>
            <CardDescription>
              Exemple de styles de texte à conserver pour rester homogène.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Libellé / métadonnée
              </p>
              <p className="text-xl font-semibold">Titre de section</p>
              <p className="text-sm text-muted-foreground">
                Texte d&apos;accompagnement. Utiliser des phrases courtes et
                explicites pour les descriptions.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">
                Zone secondaire (bg-muted) pour contenus contextuels.
              </p>
              <p className="text-sm text-muted-foreground">
                Pratique pour des aides, notes ou encarts de résumé.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
