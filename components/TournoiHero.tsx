export default function TournoiHero() {
  return (
    <section className="bg-purple-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-28">
        <div className="max-w-3xl">
          <p className="uppercase tracking-wide text-sm text-purple-200 mb-4">
            Tournoi annuel du club
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tournoi de Pâques
          </h1>

          <p className="text-lg text-purple-100 mb-8 leading-relaxed">
            Le <strong>Tournoi de Pâques</strong> est le tournoi annuel organisé
            par le Châlons-en-Champagne Tennis de Table. Ouvert aux joueurs de
            tous niveaux, il rassemble chaque année de nombreux compétiteurs
            dans une ambiance conviviale et sportive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/inscriptions"
              className="inline-flex justify-center bg-white text-purple-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition"
            >
              S’inscrire au tournoi
            </a>

            <a
              href="/reglement"
              className="inline-flex justify-center border border-white text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
            >
              Voir le règlement
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
