import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TournoiHomePage() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Accueil tournoi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Bienvenue sur l&apos;espace tournoi. Cette page servira de point
            d&apos;entrée pour les prochaines pages liées à l&apos;organisation du
            tournoi.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
