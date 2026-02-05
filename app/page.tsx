import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TournoiHero from "@/components/TournoiHero";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Châlons-en-Champagne
              <br />
              Tennis de Table
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Club de tennis de table à Châlons-en-Champagne – loisirs et
              compétition, jeunes et adultes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/horaires"
                className="inline-flex justify-center bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
              >
                Voir les horaires
              </a>

              <a
                href="/contact"
                className="inline-flex justify-center border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-50 transition"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRÉSENTATION */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Bienvenue au CCTT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              Le <strong>Châlons-en-Champagne Tennis de Table (CCTT)</strong>{" "}
              accueille joueurs débutants comme confirmés dans un cadre
              convivial et structuré. Que vous souhaitiez pratiquer le tennis de
              table en loisir ou en compétition, notre club propose des
              entraînements adaptés à tous les niveaux et à tous les âges.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Encadré par un équipe d&apos;entraineurs professionnels diplômés,
              le club met l’accent sur la progression, le respect et le plaisir
              du jeu.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* MISE EN VALEUR */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-semibold mb-12">
            Le club en quelques mots
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>Tous les niveaux</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Enfants, adultes, débutants ou joueurs confirmés : chacun
                  trouve sa place au CCTT.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loisir & compétition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Une pratique adaptée à vos objectifs, du loisir à la
                  compétition officielle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Esprit club</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Convivialité, respect et engagement sont au cœur de la vie du
                  club.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* APPEL À L’ACTION */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="bg-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">
                Envie de nous rejoindre ?
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              <p className="max-w-2xl">
                Venez essayer le tennis de table au sein du Châlons-en-Champagne
                Tennis de Table. Les essais sont possibles avant toute
                inscription.
              </p>

              <a
                href="/contact"
                className="inline-block bg-white text-purple-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Nous contacter
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <h2 className="text-3xl font-semibold mb-12">Événement du club</h2>

          <TournoiHero />
        </div>
      </section>
    </>
  );
}
