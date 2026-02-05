import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Le Club</h1>
        <p className="text-gray-600 max-w-3xl">
          Découvrez le Châlons-en-Champagne Tennis de Table, ses valeurs et son
          engagement au service de la pratique du tennis de table.
        </p>
      </header>

      {/* PRÉSENTATION */}
      <section>
        <Card className="bg-purple-50">
          <CardHeader>
            <CardTitle>Présentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed max-w-4xl">
              Fondé à Châlons-en-Champagne, le <strong>CCTT</strong> est un club
              affilié à la Fédération Française de Tennis de Table. Le club a
              pour objectif de promouvoir la pratique du tennis de table, aussi
              bien en loisir qu’en compétition, dans un esprit de respect, de
              convivialité et de progression.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* VALEURS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Nos valeurs</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {/* ACCESSIBILITÉ */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Un club ouvert à tous les publics, quel que soit l’âge ou le
                niveau.
              </p>
            </CardContent>
          </Card>

          {/* CONVIVIALITÉ */}
          <Card>
            <CardHeader>
              <CardTitle>Convivialité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Un esprit d’équipe et une ambiance conviviale au cœur du club.
              </p>
            </CardContent>
          </Card>

          {/* ENCADREMENT */}
          <Card>
            <CardHeader>
              <CardTitle>Encadrement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Des entraînements encadrés avec sérieux et pédagogie.
              </p>
            </CardContent>
          </Card>

          {/* RESPECT */}
          <Card>
            <CardHeader>
              <CardTitle>Respect & fair-play</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Des valeurs sportives essentielles dans la pratique et la
                compétition.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
