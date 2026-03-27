import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1) Vue d'ensemble",
    items: [
      "Surveillez le compteur de dossiers et les tableaux presque pleins.",
      "Utilisez la recherche pour retrouver rapidement un joueur.",
      "Vérifiez les dernières inscriptions (ordre chronologique).",
    ],
  },
  {
    title: "2) Gestion des tableaux",
    items: [
      "Passez un joueur en liste d'attente si un tableau est complet.",
      "Vérifiez le quota max et la cohérence des catégories.",
      "Corrigez les engagements si besoin (ex: doublon, erreur de tableau).",
    ],
  },
  {
    title: "3) Dossiers en attente",
    items: [
      "Relancez les paiements en attente via la page Paiements.",
      "Ne validez pas un dossier incomplet sans confirmation du joueur.",
      "Signalez les anomalies (email manquant, contact incomplet).",
    ],
  },
  {
    title: "4) Qualité des données",
    items: [
      "Vérifiez la licence, le club et les points.",
      "Corrigez l'orthographe si besoin avant édition des listes.",
      "Unifiez le format des noms (MAJ/Minuscules).",
    ],
  },
  {
    title: "5) Avant le jour J",
    items: [
      "Exporter la liste des inscrits pour validation finale.",
      "Bloquer les inscriptions si la salle est complète.",
      "Préparer le pointage avec les joueurs confirmés.",
    ],
  },
];

export default async function AdminTournoiDocumentationInscriptionsPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Inscriptions"
      description="Bonnes pratiques pour suivre et corriger les dossiers entrants."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Inscriptions</span>
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
