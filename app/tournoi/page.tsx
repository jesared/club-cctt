import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    titre: "Série Open",
    description: "Ouverte à tous les licenciés, sans condition de classement.",
  },
  {
    titre: "Série Jeunes",
    description: "Tableaux dédiés aux catégories U11, U13 et U15.",
  },
  {
    titre: "Série Loisirs",
    description:
      "Pour les joueurs non classés ou en reprise, dans un format convivial.",
  },
];

const horaires = [
  {
    jour: "Samedi",
    details: "Accueil dès 8h00, début des premiers matchs à 9h00.",
  },
  {
    jour: "Dimanche",
    details: "Phase finale à partir de 9h30, remise des récompenses à 17h30.",
  },
];

export default function TournoiHomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16 space-y-10">
      <Card className="bg-purple-50 border-l-4 border-l-purple-500">
        <CardHeader>
          <p className="uppercase tracking-wide text-sm text-purple-600 mb-2">
            Tournoi de Pâques 2026
          </p>
          <CardTitle className="text-3xl md:text-4xl">
            Toutes les infos pour préparer votre week-end compétition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <p>
            Le Châlons-en-Champagne Tennis de Table vous accueille pour son
            tournoi annuel dans une ambiance sportive et conviviale. Retrouvez
            ci-dessous les informations pratiques pour organiser votre venue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/tournoi/inscription"
              className="inline-flex justify-center bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
            >
              S&apos;inscrire au tournoi
            </a>
            <a
              href="/tournoi/reglement"
              className="inline-flex justify-center border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-100 transition"
            >
              Lire le règlement
            </a>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations pratiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              <strong>Lieu :</strong> Gymnase Pierre-de-Coubertin, Châlons-en-
              Champagne.
            </p>
            <p>
              <strong>Accueil :</strong> Pointage des joueurs 30 minutes avant
              le début de chaque série.
            </p>
            <p>
              <strong>Restauration :</strong> Buvette et petite restauration sur
              place pendant tout le tournoi.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horaires clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            {horaires.map((item) => (
              <div key={item.jour}>
                <p className="font-semibold">{item.jour}</p>
                <p>{item.details}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Catégories proposées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((categorie) => (
                <div key={categorie.titre} className="rounded-lg border p-4">
                  <p className="font-semibold mb-2">{categorie.titre}</p>
                  <p className="text-sm text-gray-700">{categorie.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Contact organisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              Pour toute question (inscription, horaires, hébergement), vous
              pouvez contacter l&apos;équipe organisatrice.
            </p>
            <p>
              <strong>Email :</strong> tournoi@cctt.fr
            </p>
            <p>
              <strong>Téléphone :</strong> 06 12 34 56 78
            </p>
            <a
              href="/contact"
              className="inline-flex justify-center border border-purple-600 text-purple-600 px-5 py-2 rounded-md hover:bg-purple-50 transition"
            >
              Contacter le club
            </a>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
