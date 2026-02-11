import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    titre: "Tableaux messieurs & dames",
    description:
      "Plusieurs tableaux par tranches de classement pour permettre à chacun de jouer à son niveau.",
  },
  {
    titre: "Tableaux jeunes",
    description:
      "Tableaux dédiés aux catégories jeunes, avec application du règlement FFTT en vigueur.",
  },
  {
    titre: "Consolantes selon tableaux",
    description:
      "Des consolantes peuvent être proposées selon le nombre d'engagés et l'organisation des séries.",
  },
];

const horaires = [
  {
    jour: "Pointage",
    details:
      "Le pointage se fait avant chaque tableau, selon l'horaire officiel affiché par l'organisation.",
  },
  {
    jour: "Compétition",
    details:
      "Les rencontres se jouent sur l'ensemble du week-end de Pâques, des phases de poules aux tableaux finaux.",
  },
];

export default function TournoiHomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16 space-y-10">
      <Card className="bg-purple-50 border-l-4 border-l-purple-500">
        <CardHeader>
          <p className="uppercase tracking-wide text-sm text-purple-600 mb-2">
            Tournoi national de Pâques 2026
          </p>
          <CardTitle className="text-3xl md:text-4xl">
            Les informations officielles pour préparer votre venue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <p>
            Le Châlons-en-Champagne Tennis de Table organise son tournoi national
            de Pâques dans le respect du règlement FFTT. Retrouvez ici une
            synthèse pratique des informations importantes (accueil, tableaux,
            inscriptions et contacts).
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
              Consulter le règlement 2026
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
              <strong>Lieu :</strong> Gymnase Jean-François Kiezer, 150B avenue
              des Alliés, 51000 Châlons-en-Champagne.
            </p>
            <p>
              <strong>Accueil :</strong> Présence recommandée en avance pour le
              pointage avant votre premier match.
            </p>
            <p>
              <strong>Restauration :</strong> Buvette et petite restauration sur
              place pendant tout le tournoi.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisation sportive</CardTitle>
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
            <CardTitle>Tableaux proposés</CardTitle>
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
            <p className="text-sm text-gray-600 mt-4">
              Le détail complet des tableaux, horaires et limitations
              d&apos;engagement est précisé dans le règlement officiel 2026.
            </p>
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
