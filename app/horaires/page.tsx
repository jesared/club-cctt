import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HorairesPage() {
  const badgeBase = "inline-block text-xs font-medium px-2 py-1 rounded-md";

  const badgeJeunes = `${badgeBase} bg-purple-100 text-purple-700`;
  const badgeElite = `${badgeBase} bg-blue-100 text-blue-700`;
  const badgeLoisir = `${badgeBase} bg-green-100 text-green-700`;
  const badgeLibre = `${badgeBase} bg-gray-100 text-gray-700`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
      {/* TITRE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Horaires d’entraînement</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ci-dessous l’ensemble des créneaux d’entraînement du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      {/* HORAIRES PAR JOUR */}
      <section className="space-y-8">
        {/* LUNDI */}
        <Card>
          <CardHeader>
            <CardTitle>Lundi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <span className={badgeJeunes}>Jeunes</span>
              <span>17h45 – 19h (Primaires + Handis)</span>
            </p>

            <p className="flex items-center gap-2">
              <span className={badgeLibre}>Libre</span>
              <span>19h00 (Départementaux)</span>
            </p>
          </CardContent>
        </Card>

        {/* MARDI */}
        <Card>
          <CardHeader>
            <CardTitle>Mardi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <span className={badgeJeunes}>Jeunes</span> 17h00 – 18h (Panier
              balles)
            </p>
            <p className="flex items-center gap-2">
              <span className={badgeElite}>Élite</span>
              <span>18h00 – 19h30 (Élite + Lycée)</span>
            </p>

            <p className="flex items-center gap-2">
              <span className={badgeLoisir}>Sport santé</span>
              <span>10h00 – 11h00</span>
            </p>

            <p>
              <strong>Libre</strong> : 9h00 – 11h00 (Vétérans)
            </p>
          </CardContent>
        </Card>

        {/* MERCREDI */}
        <Card>
          <CardHeader>
            <CardTitle>Mercredi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>
              <strong>Baby Ping</strong> : 13h30 – 14h30
            </p>
            <p>
              <strong>Primaires</strong> : 14h30 – 16h00
            </p>
            <p>
              <strong>Collèges</strong> : 16h00 – 17h30
            </p>
            <p>
              <strong>Section sportive (Lycées)</strong> : 17h30 – 19h00
            </p>
            <p>
              <strong>Loisirs dirigés</strong> : 19h00 – 20h30
            </p>
            <p>
              <strong>Libre</strong> : 19h00 (Départementaux)
            </p>
          </CardContent>
        </Card>

        {/* JEUDI */}
        <Card>
          <CardHeader>
            <CardTitle>Jeudi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>
              <strong>Jeunes</strong> : 17h00 – 18h00 (Panier balles)
            </p>
            <p>
              <strong>Élite</strong> : 18h00 – 19h30 (Primaires – Collège)
            </p>
          </CardContent>
        </Card>

        {/* VENDREDI */}
        <Card>
          <CardHeader>
            <CardTitle>Vendredi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>
              <strong>Débutants – Moyens</strong> : 17h00 – 18h00
            </p>
            <p>
              <strong>Lycées & Collèges</strong> : 18h00 – 19h30
            </p>
          </CardContent>
        </Card>

        {/* SAMEDI */}
        <Card>
          <CardHeader>
            <CardTitle>Samedi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>
              <strong>Loisirs libres</strong> : 10h00 – 11h30
            </p>
          </CardContent>
        </Card>
      </section>

      {/* LIEU */}
      <section>
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Lieu d’entraînement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700 max-w-3xl">
            <p>
              Les entraînements ont lieu à la <strong>salle Tirlet</strong>.
            </p>
            <p>
              <strong>Adresse :</strong> Rue de la Charrière, cité
              administrative Tirlet, 51000 Châlons-en-Champagne
            </p>
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
