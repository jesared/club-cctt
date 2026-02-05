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
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold mb-6">Bienvenue au CCTT</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Le <strong>Châlons-en-Champagne Tennis de Table (CCTT)</strong>{" "}
            accueille joueurs débutants comme confirmés dans un cadre convivial
            et structuré. Que vous souhaitiez pratiquer le tennis de table en
            loisir ou en compétition, notre club propose des entraînements
            adaptés à tous les niveaux et à tous les âges.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Encadré par un équipe d&apos;entraineurs professionnels diplômés, le
            club met l’accent sur la progression, le respect et le plaisir du
            jeu.
          </p>
        </div>
      </section>

      {/* MISE EN VALEUR */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-semibold mb-12">
            Le club en quelques mots
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Tous les niveaux</h3>
              <p className="text-gray-600 text-sm">
                Enfants, adultes, débutants ou joueurs confirmés : chacun trouve
                sa place au CCTT.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Loisir & compétition</h3>
              <p className="text-gray-600 text-sm">
                Une pratique adaptée à vos objectifs, du loisir à la compétition
                officielle.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Esprit club</h3>
              <p className="text-gray-600 text-sm">
                Convivialité, respect et engagement sont au cœur de la vie du
                club.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APPEL À L’ACTION */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-purple-600 rounded-lg px-8 py-12 text-white">
            <h2 className="text-3xl font-semibold mb-4">
              Envie de nous rejoindre ?
            </h2>
            <p className="mb-6 max-w-2xl">
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
          </div>
        </div>
      </section>
      <TournoiHero />
    </>
  );
}
