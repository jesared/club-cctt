import {
  BadgeEuro,
  ClipboardPen,
  Download,
  FileText,
  LayoutGrid,
  Users,
} from "lucide-react";

import { TournamentAdminPage, requireAdminSession } from "../_components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Préparer le tournoi",
    icon: ClipboardPen,
    href: "/admin/tournoi/documentation/preparer",
    items: [
      "Créer le tournoi (statut DRAFT puis PUBLISHED).",
      "Définir les dates d'ouverture/fermeture des inscriptions.",
      "Configurer les tableaux (codes, horaires, points, prix).",
    ],
  },
  {
    title: "Templates",
    icon: LayoutGrid,
    href: "/admin/tournoi/documentation/templates",
    items: [
      "Mettre à jour le template tournoi et les templates tableaux.",
      "Utiliser les templates pour créer un nouveau tournoi plus vite.",
      "Vérifier les horaires et prix avant publication.",
    ],
  },
  {
    title: "Inscriptions",
    icon: Users,
    href: "/admin/tournoi/documentation/inscriptions",
    items: [
      "Suivre les dossiers entrants et l'état des tableaux.",
      "Basculer un joueur en liste d'attente si un tableau est plein.",
      "Contrôler les doublons et corriger si nécessaire.",
    ],
  },
  {
    title: "Paiements",
    icon: BadgeEuro,
    href: "/admin/tournoi/documentation/paiements",
    items: [
      "Valider les dossiers réglés et suivre les partiels.",
      "Ajuster un montant manuel si besoin (ex: paiement en caisse).",
      "Repasser un dossier en attente si une régularisation est requise.",
    ],
  },
  {
    title: "Pointages",
    icon: FileText,
    href: "/admin/tournoi/documentation/pointages",
    items: [
      "Pointer les joueurs par jour de présence.",
      "Filtrer rapidement par attente ou paiement non réglé.",
      "Accéder aux dossiers paiement depuis le menu actions.",
    ],
  },
  {
    title: "Exports",
    icon: Download,
    href: "/admin/tournoi/documentation/exports",
    items: [
      "Exporter les inscriptions par tableau (CSV).",
      "Télécharger le ZIP complet par tableau si nécessaire.",
      "Utiliser l'export relance pour les paiements en attente.",
    ],
  },
];

export default async function AdminTournoiDocumentationPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Documentation"
      description="Guide rapide de la gestion du tournoi (admin)."
    >
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/40">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
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
                {section.href ? (
                  <a
                    href={section.href}
                    className="mt-4 inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Voir le guide
                  </a>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </TournamentAdminPage>
  );
}
