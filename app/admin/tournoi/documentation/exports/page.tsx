import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1) Exports tableaux (CSV)",
    items: [
      "Un fichier par tableau avec les joueurs inscrits.",
      "Colonnes : licence, dossard, nom, prénom, points, club.",
      "À utiliser pour les feuilles d'arbitrage.",
    ],
  },
  {
    title: "2) ZIP complet",
    items: [
      "Télécharge tous les CSV en un clic.",
      "Pratique pour préparer les documents papier.",
      "Vérifier le nombre de joueurs par tableau.",
    ],
  },
  {
    title: "3) Export relance",
    items: [
      "Liste des dossiers en attente/partiel.",
      "Permet de relancer rapidement par email/téléphone.",
      "Utiliser après un premier tri des inscriptions.",
    ],
  },
  {
    title: "4) Bonnes pratiques",
    items: [
      "Exporter juste avant la clôture des inscriptions.",
      "Conserver un export final pour l'archivage.",
      "Nommer les fichiers par date pour le suivi.",
    ],
  },
];

export default async function AdminTournoiDocumentationExportsPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Exports"
      description="Comprendre et utiliser les exports du tournoi."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Exports</span>
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
