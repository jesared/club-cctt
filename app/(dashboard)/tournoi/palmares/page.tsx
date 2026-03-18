import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PalmaresEntry = {
  annee: number;
  tc: {
    nom: string;
    club: string;
  };
  dames: {
    nom: string;
    club: string;
  };
};

const palmares: PalmaresEntry[] = [
  {
    annee: 2026,
    tc: { nom: "Alexandre Martin", club: "CCTT" },
    dames: { nom: "Julie Dupont", club: "Reims TT" },
  },
  {
    annee: 2025,
    tc: { nom: "Nicolas Bernard", club: "Châlons TT" },
    dames: { nom: "Léa Robert", club: "Épernay TT" },
  },
  {
    annee: 2024,
    tc: { nom: "Thomas Garnier", club: "Sedan TT" },
    dames: { nom: "Camille Petit", club: "CCTT" },
  },
  {
    annee: 2023,
    tc: { nom: "Maxime Laurent", club: "Tinqueux TT" },
    dames: { nom: "Sarah Moreau", club: "Charleville TT" },
  },
];

export default function TournoiPalmaresPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="mb-2 space-y-2">
        <h1 className="text-2xl font-semibold">Palmarès du tournoi</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez les vainqueurs par année pour le tableau TC et le tableau TC Dames.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Photo vainqueur TC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src="/comite/fred-perard.jpg"
                alt="Vainqueur TC"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photo vainqueure TC Dames</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
              <Image
                src="/comite/julie_Fila_Tournant.jpg"
                alt="Vainqueure TC Dames"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Palmarès par année</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Année</th>
                  <th className="py-3 pr-4 font-medium">Vainqueur TC</th>
                  <th className="py-3 font-medium">Vainqueure TC Dames</th>
                </tr>
              </thead>
              <tbody>
                {palmares.map((entree) => (
                  <tr key={entree.annee} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{entree.annee}</td>
                    <td className="py-3 pr-4">
                      <p>{entree.tc.nom}</p>
                      <p className="text-xs text-muted-foreground">{entree.tc.club}</p>
                    </td>
                    <td className="py-3">
                      <p>{entree.dames.nom}</p>
                      <p className="text-xs text-muted-foreground">{entree.dames.club}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
