import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1) Template tournoi",
    items: [
      "Le template tournoi sert de base (nom, dates, statut).",
      "Pensez à vérifier les dates d'inscription avant de publier.",
      "Conservez un template propre pour l'édition suivante.",
    ],
  },
  {
    title: "2) Templates tableaux",
    items: [
      "Chaque template tableau décrit un code, un horaire et une catégorie.",
      "Dupliquez les tableaux récurrents (ex: A/B/C) pour gagner du temps.",
      "Vérifiez les limites de points et les capacités.",
    ],
  },
  {
    title: "3) Création rapide",
    items: [
      "Créer le tournoi à partir du template.",
      "Importer les templates tableaux.",
      "Relire horaires et prix avant ouverture.",
    ],
  },
  {
    title: "4) Bonnes pratiques",
    items: [
      "Gardez des codes tableaux courts et clairs.",
      "Évitez les doublons d'horaires sur le même tableau.",
      "Préférez une nomenclature stable d'une année à l'autre.",
    ],
  },
];

export default async function AdminTournoiDocumentationTemplatesPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Templates"
      description="Références pour préparer un tournoi en quelques minutes."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Templates</span>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </TournamentAdminPage>
  );
}
