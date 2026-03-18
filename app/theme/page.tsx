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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const funnelRows = [
  {
    step: "Visite page tournoi",
    metric: "Taux de clic CTA",
    target: "≥ 20 %",
    note: "Tester des CTA plus explicites: \"Je m'inscris en 3 min\".",
  },
  {
    step: "Ouverture formulaire",
    metric: "Taux de démarrage",
    target: "≥ 65 %",
    note: "Afficher les étapes et la durée estimée dès le départ.",
  },
  {
    step: "Remplissage",
    metric: "Abandon mi-parcours",
    target: "≤ 30 %",
    note: "Réduire les champs non bloquants et clarifier les aides.",
  },
  {
    step: "Validation",
    metric: "Taux de soumission",
    target: "≥ 80 %",
    note: "Renforcer la confirmation et le suivi post-envoi.",
  },
];

const checklistItems = [
  "Lister les champs obligatoires avant ouverture du formulaire.",
  "Afficher une progression visible pour réduire l'incertitude.",
  "Pré-remplir les informations connues de l'utilisateur connecté.",
  "Montrer une validation inline (erreurs + succès) champ par champ.",
  "Ajouter une section d'aide concise sous les champs complexes.",
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tableau: suivi du tunnel</CardTitle>
            <CardDescription>
              Exemple de table lisible en clair/sombre pour piloter les métriques de conversion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Prioriser les étapes avec le plus grand écart entre objectif et réel.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Étape</TableHead>
                  <TableHead>Métrique</TableHead>
                  <TableHead>Objectif</TableHead>
                  <TableHead className="text-right">Note d&apos;action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funnelRows.map((row) => (
                  <TableRow key={row.step}>
                    <TableCell className="font-medium">{row.step}</TableCell>
                    <TableCell>{row.metric}</TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {row.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jauges: lecture rapide des états</CardTitle>
            <CardDescription>
              Les barres de progression servent à rendre le niveau d&apos;avancement immédiatement visible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Profil complété</span>
                <span className="text-muted-foreground">72%</span>
              </div>
              <progress className="h-2 w-full overflow-hidden rounded bg-muted [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" value={72} max={100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Paiement validé</span>
                <span className="text-muted-foreground">45%</span>
              </div>
              <progress className="h-2 w-full overflow-hidden rounded bg-muted [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent" value={45} max={100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Dossiers incomplets</span>
                <span className="text-muted-foreground">20%</span>
              </div>
              <progress className="h-2 w-full overflow-hidden rounded bg-muted [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-destructive [&::-moz-progress-bar]:bg-destructive" value={20} max={100} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Formulaire: structure recommandée</CardTitle>
            <CardDescription>
              Démo d&apos;un formulaire avec labels, aides contextuelles, validation et hiérarchie claire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="nom" className="text-sm font-medium">
                  Nom complet
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Ex: Camille Dupont"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Utiliser le même nom que sur la licence FFTT.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="vous@club.fr"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="categorie" className="text-sm font-medium">
                    Catégorie
                  </label>
                  <select
                    id="categorie"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choisir une catégorie
                    </option>
                    <option value="loisir">Loisir</option>
                    <option value="competition">Compétition</option>
                    <option value="jeune">Jeune</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes complémentaires
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Précisions utiles pour l'organisation..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="rounded-lg border border-dashed p-3">
                <p className="text-sm font-medium">Validation à afficher</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ✅ Champ valide (vert), ⚠️ attention (amber), ❌ erreur (rouge)
                  avec message actionnable sous le champ.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Envoyer</Button>
                <Button type="reset" variant="outline">
                  Réinitialiser
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listes: informations scannables</CardTitle>
            <CardDescription>
              Utiliser listes à puces et listes numérotées pour faciliter la lecture rapide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold">Checklist UX avant mise en production</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold">Séquence recommandée</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Définir les objectifs (conversion, rapidité, clarté).</li>
                <li>Prototyper les écrans clés avec états vides/erreurs/succès.</li>
                <li>Tester avec 5 utilisateurs et corriger les frictions majeures.</li>
                <li>Instrumenter les KPI et suivre chaque semaine.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
