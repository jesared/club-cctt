import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1) Choisir l'edition source",
    items: [
      "Repartir du tournoi le plus proche de l'edition a preparer.",
      "Verifier le nombre de tableaux qui seront copies.",
      "Les inscriptions et paiements ne sont jamais dupliques.",
    ],
  },
  {
    title: "2) Recaler les dates",
    items: [
      "La page propose les memes dates avec un an d'ecart.",
      "Les horaires des tableaux suivent le decalage entre l'ancien et le nouveau debut.",
      "Relire les ouvertures et fermetures d'inscription.",
    ],
  },
  {
    title: "3) Creer puis relire",
    items: [
      "Creer le tournoi en brouillon.",
      "La page redirige vers l'edition du nouveau tournoi.",
      "Verifier les tableaux, prix, categories et limites de points.",
    ],
  },
  {
    title: "4) Publier",
    items: [
      "Publier seulement quand les informations principales sont relues.",
      "Activer le tournoi depuis la liste si plusieurs editions existent.",
      "Faire une inscription de test avant l'ouverture publique.",
    ],
  },
];

export default async function AdminTournoiDocumentationNouveauPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Nouvelle edition"
      description="Guide pour creer un tournoi en dupliquant une edition existante."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Nouvelle edition</span>
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
