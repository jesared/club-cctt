import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "1) Créer un tournoi",
    items: [
      "Aller dans `Admin tournoi` > `Templates` si vous partez d'un modèle.",
      "Créer le tournoi avec un nom clair (ex: Open CCTT 2026).",
      "Laisser le statut en `DRAFT` tant que tout n'est pas prêt.",
    ],
  },
  {
    title: "2) Définir les dates clés",
    items: [
      "Date de début / fin du tournoi.",
      "Ouverture et fermeture des inscriptions.",
      "Vérifier le fuseau horaire (heures locales).",
    ],
  },
  {
    title: "3) Configurer les tableaux",
    items: [
      "Codes tableaux (A, B, C...) et horaires précis.",
      "Bornes de points (min / max) et catégories.",
      "Prix en ligne / sur place et capacité max.",
    ],
  },
  {
    title: "4) Vérifier avant publication",
    items: [
      "Tester une inscription complète (payer + joueur).",
      "Vérifier la liste des inscrits et le tableau des paiements.",
      "Valider la cohérence des exports CSV.",
    ],
  },
  {
    title: "5) Publier",
    items: [
      "Passer le tournoi en `PUBLISHED`.",
      "Ouvrir les inscriptions à la date prévue.",
      "Surveiller les premiers dossiers et ajuster si besoin.",
    ],
  },
];

export default async function AdminTournoiDocumentationPreparerPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Préparer le tournoi"
      description="Checklist opérationnelle avant ouverture des inscriptions."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Préparer le tournoi</span>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.title} className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                {step.items.map((item) => (
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
