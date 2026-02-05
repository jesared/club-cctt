export default function ClubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Le Club</h1>
        <p className="text-gray-600 max-w-3xl">
          Découvrez le Châlons-en-Champagne Tennis de Table, ses valeurs et son
          engagement au service de la pratique du tennis de table.
        </p>
      </header>

      {/* PRÉSENTATION */}
      <section className="bg-purple-50 rounded-lg">
        <div className="px-6 py-10 md:px-12">
          <h2 className="text-2xl font-semibold mb-4">Présentation</h2>
          <p className="text-gray-700 leading-relaxed max-w-4xl">
            Fondé à Châlons-en-Champagne, le <strong>CCTT</strong> est un club
            affilié à la Fédération Française de Tennis de Table. Le club a pour
            objectif de promouvoir la pratique du tennis de table, aussi bien en
            loisir qu’en compétition, dans un esprit de respect, de convivialité
            et de progression.
          </p>
        </div>
      </section>

      {/* VALEURS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Nos valeurs</h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          <li className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Accessibilité</h3>
            <p className="text-sm text-gray-600">
              Un club ouvert à tous les publics, quel que soit l’âge ou le
              niveau.
            </p>
          </li>

          <li className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Convivialité</h3>
            <p className="text-sm text-gray-600">
              Un esprit d’équipe et une ambiance conviviale au cœur du club.
            </p>
          </li>

          <li className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Encadrement</h3>
            <p className="text-sm text-gray-600">
              Des entraînements encadrés avec sérieux et pédagogie.
            </p>
          </li>

          <li className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Respect & fair-play</h3>
            <p className="text-sm text-gray-600">
              Des valeurs sportives essentielles dans la pratique et la
              compétition.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
