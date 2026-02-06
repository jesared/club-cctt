import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function HorairesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE */}
      <header className="space-y-3">
        <h1 className="text-4xl font-bold mb-4">Horaires d’entraînement</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ci-dessous l’ensemble des créneaux d’entraînement du
          Châlons-en-Champagne Tennis de Table.
        </p>
        <div className="text-sm text-gray-500 max-w-3xl space-y-2">
          <p>
            Ces horaires sont donnés à titre indicatif. Ils peuvent évoluer
            pendant les vacances scolaires ou lors des jours fériés.
          </p>
          <p>
            Pour toute question,{" "}
            <Link className="text-purple-600 hover:underline" href="/contact">
              contactez-nous
            </Link>
            .
          </p>
        </div>
      </header>

      {/* HORAIRES PAR JOUR */}
      <section className="space-y-8">
        <div className="space-y-4">
          <div className="text-gray-600">
            <h2 className="text-xl font-semibold text-gray-900">
              Créneaux par jour
            </h2>
            <p className="mt-2">
              Les créneaux sont classés par jour puis par horaire pour une
              lecture plus rapide.
            </p>
          </div>
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Légende</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={"jeunes"}>Jeunes</Badge>
                  <span>Entraînements encadrés pour les jeunes.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={"elite"}>Élite</Badge>
                  <span>Groupes à niveau confirmé.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={"loisir"}>Loisir</Badge>
                  <span>Pratique loisir et sport santé.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={"libre"}>Libre</Badge>
                  <span>Jeu libre réservé aux licenciés.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* LUNDI */}
        <Card>
          <CardHeader>
            <CardTitle>Lundi</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Jeunes</Badge>
                <span>17h45 – 19h00 (Primaires + Handis)</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"libre"}>Libre</Badge>
                <span>19h00 (Départementaux)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* MARDI */}
        <Card>
          <CardHeader>
            <CardTitle>Mardi</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant={"libre"}>Libre</Badge>
                <span>09h00 – 11h00 (Vétérans)</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"loisir"}>Sport santé</Badge>
                <span>10h00 – 11h00</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Jeunes</Badge>
                <span>17h00 – 18h00 (Panier balles)</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"elite"}>Élite</Badge>
                <span>18h00 – 19h30 (Élite + Lycée)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* MERCREDI */}
        <Card>
          <CardHeader>
            <CardTitle>Mercredi</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Baby Ping</Badge>
                <span>13h30 – 14h30</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Primaires</Badge>
                <span>14h30 – 16h00</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Collèges</Badge>
                <span>16h00 – 17h30</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Section sportive (Lycées)</Badge>
                <span>17h30 – 19h00</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"loisir"}>Loisirs dirigés</Badge>
                <span>19h00 – 20h30</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"libre"}>Libre</Badge>
                <span>19h00 (Départementaux)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* JEUDI */}
        <Card>
          <CardHeader>
            <CardTitle>Jeudi</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Jeunes</Badge>
                <span>17h00 – 18h00 (Panier balles)</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"elite"}>Élite</Badge>
                <span>18h00 – 19h30 (Primaires – Collège)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* VENDREDI */}
        <Card>
          <CardHeader>
            <CardTitle>Vendredi</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Débutants – Moyens</Badge>
                <span>17h00 – 18h00</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant={"jeunes"}>Lycées et Collèges</Badge>
                <span>18h00 – 19h30</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* SAMEDI */}
        <Card>
          <CardHeader>
            <CardTitle>Samedi</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant={"loisir"}>Loisirs libres</Badge>
                <span>10h00 – 11h30</span>
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
          <CardContent className="space-y-3">
            <p className="text-gray-700 max-w-3xl">
              Les nouveaux joueurs peuvent venir essayer gratuitement avant
              toute inscription. N’hésitez pas à nous contacter pour plus
              d’informations.
            </p>
            <Link
              className="inline-flex items-center font-medium text-purple-600 hover:underline"
              href="/contact"
            >
              Demander un essai gratuit
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
