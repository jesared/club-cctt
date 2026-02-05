export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold mb-4">
            Châlons-en-Champagne Tennis de Table
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Club de tennis de table – Loisirs et compétition
          </p>
          <a
            href="/horaires"
            className="inline-block bg-black text-white px-6 py-3 rounded-md"
          >
            Voir les horaires
          </a>
          <a
            href="/contact"
            className="inline-block bg-black text-white px-6 py-3 rounded-md"
          >
            Nous contacter
          </a>
        </div>
      </section>

      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-4">Bienvenue au CCTT</h2>
        <p className="text-gray-700 leading-relaxed max-w-3xl">
          Le Châlons-en-Champagne Tennis de Table (CCTT) accueille joueurs
          débutants comme confirmés dans un cadre convivial et structuré. Que
          vous souhaitiez pratiquer le tennis de table en loisir ou en
          compétition, notre club propose des entraînements adaptés à tous les
          niveaux et à tous les âges.
        </p>
      </section>
    </>
  );
}
