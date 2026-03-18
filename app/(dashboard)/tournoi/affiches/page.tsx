import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePopup } from "@/components/ui/image-popup";

const affiches = [
  {
    id: "A1",
    titre: "Affiche 2026",
    description: "",
    format: "A3 / HD",
    url: "/affiches/affiche2026.jpg",
  },
  {
    id: "A2",
    titre: "Tableaux jeunes",
    description: "Version dédiée à la promotion des catégories jeunes.",
    format: "A4 / Web",
  },
  {
    id: "A3",
    titre: "Tableaux adultes",
    description: "Version orientée inscriptions adultes et compétiteurs.",
    format: "A4 / Web",
  },
  {
    id: "A4",
    titre: "Programme du week-end",
    description: "Affiche des horaires clés: pointage, début et finales.",
    format: "A3",
  },
  {
    id: "A5",
    titre: "Tarifs & inscriptions",
    description: "Rappel des prix et du lien d'inscription.",
    format: "Story + Feed",
  },
  {
    id: "A6",
    titre: "Partenaires",
    description: "Mise en avant des partenaires institutionnels et privés.",
    format: "A3 / Web",
  },
  {
    id: "A7",
    titre: "Infos pratiques",
    description: "Accès salle, restauration, parking et contacts utiles.",
    format: "A4",
  },
  {
    id: "A8",
    titre: "Règlement",
    description: "Résumé des règles principales et conditions FFTT.",
    format: "A4 / PDF",
  },
  {
    id: "A9",
    titre: "Live résultats",
    description: "Affiche pour annoncer le suivi en direct des tableaux.",
    format: "Web",
  },
  {
    id: "A10",
    titre: "Aftermovie & remerciements",
    description: "Visuel post-événement avec liens photos/vidéos.",
    format: "Feed",
  },
];

export default function TournoiAffichesPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Affiches du tournoi</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Cette page est prête pour accueillir environ 10 affiches du tournoi.
          Chaque carte représente un emplacement prévu pour un visuel final.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {affiches.map((affiche) => (
          <Card key={affiche.id} className="overflow-hidden">
            <CardHeader className="space-y-3">
              {affiche.url ? (
                <ImagePopup
                  src={affiche.url}
                  alt={affiche.titre}
                  title={affiche.titre}
                  width={320}
                  height={400}
                  previewClassName="cover rounded-md border border-dashed border-muted-foreground/30 bg-muted/50"
                />
              ) : (
                <div className="aspect-[3/4] rounded-md border border-dashed border-muted-foreground/30 bg-muted/50" />
              )}
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{affiche.titre}</CardTitle>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {affiche.id}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-sm text-muted-foreground">
                {affiche.description}
              </p>
              <p className="text-xs text-muted-foreground/80">
                Format conseillé: {affiche.format}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
