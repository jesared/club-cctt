export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-gray-50">
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
        </div>
      </section>

      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-4">Bienvenue au CCTT</h2>
        <p className="text-gray-700 leading-relaxed max-w-3xl">
          Le club de tennis de table de Châlons-en-Champagne accueille enfants
          et adultes, en loisir comme en compétition, dans un cadre convivial et
          structuré.
        </p>
      </section>
    </>
  );
}
