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

      {/* HORAIRES */}
      <section className="space-y-8">
        {/* LÉGENDE */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Légende</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="jeunes">Jeunes</Badge>
                <span>Entraînements encadrés pour les jeunes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="elite">Élite</Badge>
                <span>Groupes à niveau confirmé</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="loisir">Loisir</Badge>
                <span>Pratique loisir et sport santé</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="libre">Libre</Badge>
                <span>Jeu libre réservé aux licenciés</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JOURS */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* LUNDI */}
          <Card>
            <CardHeader>
              <CardTitle>Lundi</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Jeunes</Badge>
                  <span>17h00 – 18h00 (Débutants)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Jeunes</Badge>
                  <span>18h00 – 19h00 (Moyens)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="libre">Libre</Badge>
                  <Badge variant="elite">Élite</Badge>
                  <span>19h00 – 20h30 (Départementaux)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* MARDI */}
          <Card>
            <CardHeader>
              <CardTitle>Mardi</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="libre">Libre</Badge>
                  <span>09h00 – 11h00 (Vétérans)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="loisir">Sport santé</Badge>
                  <span>10h00 – 11h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Jeunes</Badge>
                  <span>17h00 – 18h00 (Panier balles)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="elite">Élite</Badge>
                  <span>18h00 – 20h00</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* MERCREDI */}
          <Card>
            <CardHeader>
              <CardTitle>Mercredi</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Baby Ping</Badge>
                  <span>13h30 – 14h30</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Primaires</Badge>
                  <span>14h30 – 16h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Collèges</Badge>
                  <span>16h00 – 17h30</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Section sportive</Badge>
                  <span>17h30 – 19h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="loisir">Loisir dirigé</Badge>
                  <span>19h00 – 20h30</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* JEUDI */}
          <Card>
            <CardHeader>
              <CardTitle>Jeudi</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="libre">Libre</Badge>
                  <span>à partir de 16h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Jeunes</Badge>
                  <span>17h00 – 18h00 (Panier balles)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="elite">Élite</Badge>
                  <span>18h00 – 19h30</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* VENDREDI */}
          <Card>
            <CardHeader>
              <CardTitle>Vendredi</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Débutants – Moyens</Badge>
                  <span>17h00 – 18h00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="jeunes">Lycées – Collèges</Badge>
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
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="loisir">Loisir libre</Badge>
                  <span>10h00 – 11h30</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ESSAI */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle>Essai gratuit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 max-w-3xl mb-3">
            Les nouveaux joueurs peuvent venir essayer gratuitement avant toute
            inscription.
          </p>
          <Link
            href="/contact"
            className="text-purple-600 font-medium hover:underline"
          >
            Demander un essai gratuit
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
