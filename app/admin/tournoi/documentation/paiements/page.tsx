import Link from "next/link";

import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1) Lecture rapide des dossiers",
    items: [
      "Utilisez les chips (En attente / À régulariser / Payés).",
      "Priorisez les dossiers avec le reste à encaisser le plus élevé.",
      "Surveillez les dossiers groupés (plusieurs joueurs).",
    ],
  },
  {
    title: "2) Validation d'un paiement",
    items: [
      "Ouvrir un dossier, vérifier le payeur et les joueurs associés.",
      "Valider le paiement si le règlement est complet.",
      "Le dossier passe automatiquement en Payé.",
    ],
  },
  {
    title: "3) Montant manuel",
    items: [
      "Saisir un montant encaissé (ex: paiement en caisse).",
      "Le dossier bascule en Partiel si un reste existe.",
      "Vérifier le récapitulatif après enregistrement.",
    ],
  },
  {
    title: "4) Régularisations",
    items: [
      "Marquer à régulariser si le paiement est incomplet.",
      "Repasser en attente si un paiement est annulé.",
      "Utiliser la note interne pour tracer l'échange.",
    ],
  },
  {
    title: "5) Relances",
    items: [
      "Exporter la liste des dossiers à relancer (CSV).",
      "Prioriser les relances par montant restant.",
      "Vérifier les contacts manquants.",
    ],
  },
];

export default async function AdminTournoiDocumentationPaiementsPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Guide de validation, régularisation et suivi des dossiers."
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin/tournoi/documentation" className="hover:underline">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-foreground">Paiements</span>
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
