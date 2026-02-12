import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const informationsTournoi = {
  nom: "Tournoi National Chalons en Champagne TT",
  organisateur: "Chalons en Champagne TT",
  lieu: "Gymnase Kiezer, 150 avenue des Alliés, Chalons en Champagne",
  tables: 30,
  homologation: "FFTT",
  format: {
    matchs: "Best of 5 games",
    poules: "Poules de 3 joueurs",
    qualifies: "2 qualifiés par poule",
    phaseFinale: "Élimination directe",
  },
  inscriptions: {
    dateLimite: "04/04/2026",
    chequeLimite: "02/04/2026",
    paiementEnLigne: "04/04/2026",
    remboursement: "50% remboursement sur justificatif médical uniquement",
  },
  contact: {
    nom: "Jean Marc HAUTIER",
    telephone: "06 66 09 69 16",
    email: "jean-marc.hautier@wanadoo.fr",
    site: "https://cctt.fr",
    paiement: "https://tournoi.cctt.fr",
  },
};

const tableaux = [
  { code: "C", date: "Samedi 04/04", heure: "10:30", categorie: "800 à 1399 pts", online: "8€", surPlace: "9€" },
  { code: "A", date: "Samedi 04/04", heure: "11:30", categorie: "500 à 799 pts", online: "8€", surPlace: "9€" },
  { code: "D", date: "Samedi 04/04", heure: "12:30", categorie: "1100 à 1699 pts", online: "8€", surPlace: "9€" },
  { code: "B", date: "Samedi 04/04", heure: "13:30", categorie: "500 à 1099 pts", online: "8€", surPlace: "9€" },
  { code: "F", date: "Dimanche 05/04", heure: "08:30", categorie: "500 à 1199 pts", online: "8€", surPlace: "9€" },
  { code: "H", date: "Dimanche 05/04", heure: "09:30", categorie: "1200 à 1799 pts", online: "8€", surPlace: "9€" },
  { code: "E", date: "Dimanche 05/04", heure: "11:00", categorie: "500 à 899 pts", online: "8€", surPlace: "9€" },
  { code: "G", date: "Dimanche 05/04", heure: "12:00", categorie: "900 à 1499 pts", online: "8€", surPlace: "9€" },
  { code: "I", date: "Dimanche 05/04", heure: "13:15", categorie: "500 à N°400", online: "9€", surPlace: "10€" },
  { code: "J", date: "Dimanche 05/04", heure: "14:30", categorie: "Dames TC", online: "8€", surPlace: "9€" },
  { code: "L", date: "Lundi 06/04", heure: "08:30", categorie: "500 à 1299 pts", online: "8€", surPlace: "9€" },
  { code: "N", date: "Lundi 06/04", heure: "09:30", categorie: "1300 à 2099 pts", online: "8€", surPlace: "9€" },
  { code: "K", date: "Lundi 06/04", heure: "11:00", categorie: "500 à 999 pts", online: "8€", surPlace: "9€" },
  { code: "M", date: "Lundi 06/04", heure: "12:00", categorie: "1000 à 1599 pts", online: "8€", surPlace: "9€" },
  { code: "P", date: "Lundi 06/04", heure: "13:15", categorie: "TC", online: "10€", surPlace: "11€" },
];

export default function TournoiHomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16 space-y-10">
      <Card className="bg-purple-50 border-l-4 border-l-purple-500">
        <CardHeader>
          <p className="uppercase tracking-wide text-sm text-purple-600 mb-2">{informationsTournoi.organisateur}</p>
          <CardTitle className="text-3xl md:text-4xl">{informationsTournoi.nom}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <p>
            Tournoi homologué {informationsTournoi.homologation} sur {informationsTournoi.tables} tables,
            du samedi 4 au lundi 6 avril 2026.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={informationsTournoi.contact.paiement}
              className="inline-flex justify-center bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
            >
              S&apos;inscrire en ligne
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
              <strong>Lieu :</strong> {informationsTournoi.lieu}
            </p>
            <p>
              <strong>Format :</strong> {informationsTournoi.format.matchs}, {informationsTournoi.format.poules}, {" "}
              {informationsTournoi.format.qualifies}, puis {informationsTournoi.format.phaseFinale}.
            </p>
            <p>
              <strong>Inscriptions :</strong> jusqu&apos;au {informationsTournoi.inscriptions.dateLimite} (paiement en ligne possible
              jusqu&apos;au {informationsTournoi.inscriptions.paiementEnLigne}).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact organisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              <strong>Responsable :</strong> {informationsTournoi.contact.nom}
            </p>
            <p>
              <strong>Téléphone :</strong> {informationsTournoi.contact.telephone}
            </p>
            <p>
              <strong>Email :</strong> {informationsTournoi.contact.email}
            </p>
            <a
              href={informationsTournoi.contact.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center border border-purple-600 text-purple-600 px-5 py-2 rounded-md hover:bg-purple-50 transition"
            >
              Site officiel du club
            </a>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Tableaux (avec horaires)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Code</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Heure</th>
                    <th className="py-2 pr-4">Catégorie</th>
                    <th className="py-2 pr-4">Online</th>
                    <th className="py-2">Sur place</th>
                  </tr>
                </thead>
                <tbody>
                  {tableaux.map((tableau) => (
                    <tr key={tableau.code} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-semibold">{tableau.code}</td>
                      <td className="py-2 pr-4">{tableau.date}</td>
                      <td className="py-2 pr-4">{tableau.heure}</td>
                      <td className="py-2 pr-4">{tableau.categorie}</td>
                      <td className="py-2 pr-4">{tableau.online}</td>
                      <td className="py-2">{tableau.surPlace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Chèque jusqu&apos;au {informationsTournoi.inscriptions.chequeLimite}. {informationsTournoi.inscriptions.remboursement}.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
