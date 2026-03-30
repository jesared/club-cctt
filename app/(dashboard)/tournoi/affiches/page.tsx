import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePopup } from "@/components/ui/image-popup";
import Reveal from "@/components/Reveal";

const affiches = [
  {
    id: "A1",
    titre: "Affiche 2026",
    description: "",
    format: "Web",
    url: "/affiches/affiche2026.jpg",
  },
  {
    id: "A2",
    titre: "Affiche 2025",
    description: "",
    format: "Web",
    url: "/affiches/affiche2025.jpg",
  },
  {
    id: "A3",
    titre: "Affiche 2024",
    description: "",
    format: "Web",
    url: "/affiches/affiche2024.jpg",
  },
  {
    id: "A4",
    titre: "Affiche 2023",
    description: "",
    format: "Web",
    url: "/affiches/affiche2023.jpg",
  },
  {
    id: "A5",
    titre: "Affiche 2022",
    description: "",
    format: "Web",
    url: "/affiches/affiche2022.jpg",
  },
  {
    id: "A6",
    titre: "Affiche 2019",
    description: "",
    format: "Web",
    url: "/affiches/affiche2019.jpg",
  },
  {
    id: "A7",
    titre: "Affiche 2018",
    description: "",
    format: "Web",
    url: "/affiches/affiche2018.png",
  },
  {
    id: "A8",
    titre: "Affiche 2017",
    description: "",
    format: "Web",
    url: "/affiches/affiche2017.jpg",
  },
  {
    id: "A9",
    titre: "Affiche 2016",
    description: "",
    format: "Web",
    url: "/affiches/affiche2016.jpg",
  },
];

export default function TournoiAffichesPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <Reveal>
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Affiches du tournoi</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Retrouvez ici les affiches officielles du tournoi, année par année.
            Cliquez sur un visuel pour l’agrandir ou le partager.
          </p>
        </header>
      </Reveal>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {affiches.map((affiche, index) => (
          <Reveal key={affiche.id} delay={index * 120}>
            <Card className="card-hover">
              <CardHeader className="space-y-3">
                {affiche.url ? (
                  <ImagePopup
                    src={affiche.url}
                    alt={affiche.titre}
                    title={affiche.titre}
                    shareLabel={`Affiche ${affiche.titre}`}
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
                    {affiche.titre.split(" ")[1]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <p className="text-sm text-muted-foreground">
                  {affiche.description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>
    </main>
  );
}
