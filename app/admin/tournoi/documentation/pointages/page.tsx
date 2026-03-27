import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1) Préparer le pointage",
    items: [
      "Vérifier que les inscriptions et paiements sont à jour.",
      "Utiliser les filtres rapides pour isoler les dossiers critiques.",
      "Contrôler les joueurs en liste d'attente.",
    ],
  },
  {
    title: "2) Pointage par jour",
    items: [
      "Pointer les joueurs présents sur le bon jour.",
      "Utiliser les cases rapides pour gagner du temps.",
      "Les joueurs non inscrits sur la journée apparaissent en grisé.",
    ],
  },
  {
    title: "3) Gestion des paiements",
    items: [
      "Repérer les badges 'Paiement en attente' ou 'À régulariser'.",
      "Ouvrir le dossier paiement depuis le menu actions si besoin.",
      "Ne pas pointer un joueur si le règlement n'est pas validé.",
    ],
  },
  {
    title: "4) Vérifications",
    items: [
      "Surveiller les doublons ou erreurs d'identité.",
      "Garder la cohérence entre pointage et statut paiement.",
      "Mettre une note interne en cas d'exception.",
    ],
  },
];

export default async function AdminTournoiDocumentationPointagesPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Pointages"
      description="Checklist pour un pointage rapide et fiable."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Pointages</span>
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
