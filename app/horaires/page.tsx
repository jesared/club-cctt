import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HorairesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Horaires</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ci-dessous les horaires d’entraînement du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      {/* ENTRAÎNEMENTS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Horaires d’entraînement</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* JEUNES */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Jeunes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Mercredi</strong> : 14h00 – 16h00
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* ADULTES LOISIRS */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Adultes loisirs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Lundi</strong> : 18h00 – 20h00
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* COMPÉTITION */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Compétition</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Vendredi</strong> : 18h00 – 21h00
                </li>
              </ul>
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
          <CardContent className="space-y-2 text-gray-700">
            <p>
              Les entraînements ont lieu au gymnase de Châlons-en-Champagne.
            </p>
            <p>
              <strong>Adresse :</strong> Gymnase – Châlons-en-Champagne
            </p>

            {/* Plus tard : Google Maps */}
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
          <CardContent>
            <p className="text-gray-700 max-w-3xl">
              Les nouveaux joueurs peuvent venir essayer gratuitement avant
              toute inscription. N’hésitez pas à nous contacter pour plus
              d’informations.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
