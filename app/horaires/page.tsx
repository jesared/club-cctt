import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HorairesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Horaires d’entraînement</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ici l’ensemble des horaires d’entraînement du
          Châlons-en-Champagne Tennis de Table, selon les catégories et les
          niveaux de pratique.
        </p>
      </header>

      {/* ENTRAÎNEMENTS */}
      <section>
        <h2 className="text-3xl font-semibold mb-10">Séances d’entraînement</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* JEUNES */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Jeunes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700">
              <p>
                <strong>Mercredi</strong> : 14h00 – 16h00
              </p>
              <p className="text-sm text-gray-500">
                Enfants et adolescents – tous niveaux
              </p>
            </CardContent>
          </Card>

          {/* ADULTES LOISIRS */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Adultes – Loisirs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700">
              <p>
                <strong>Lundi</strong> : 18h00 – 20h00
              </p>
              <p className="text-sm text-gray-500">
                Pratique libre et encadrée
              </p>
            </CardContent>
          </Card>

          {/* COMPÉTITION */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Compétition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700">
              <p>
                <strong>Vendredi</strong> : 18h00 – 21h00
              </p>
              <p className="text-sm text-gray-500">
                Joueurs engagés en compétition
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* LIEU */}
      <section>
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Lieu d’entraînement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700 max-w-3xl">
            <p>
              Les entraînements se déroulent à la
              <strong> salle Tirlet</strong>.
            </p>
            <p>
              <strong>Adresse :</strong> Rue de la Charrière, cité
              administrative Tirlet, 51000 Châlons-en-Champagne
            </p>

            {/* future map */}
            {/* <div className="mt-6 h-64 bg-gray-200 rounded-lg" /> */}
          </CardContent>
        </Card>
      </section>

      {/* ESSAI */}
      <section>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>Essai gratuit</CardTitle>
          </CardHeader>
          <CardContent className="max-w-3xl">
            <p className="text-gray-700">
              Les nouveaux joueurs ont la possibilité de venir
              <strong> essayer gratuitement</strong> le tennis de table avant
              toute inscription. N’hésitez pas à nous contacter pour plus
              d’informations.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
