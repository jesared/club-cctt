export default function HorairesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Horaires</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ci-dessous les horaires d’entraînement du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      {/* ENTRAÎNEMENTS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Horaires d’entraînement</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* JEUNES */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Jeunes</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Mercredi</strong> : 14h00 – 16h00
              </li>
            </ul>
          </div>

          {/* ADULTES LOISIRS */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Adultes loisirs</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Lundi</strong> : 18h00 – 20h00
              </li>
            </ul>
          </div>

          {/* COMPÉTITION */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Compétition</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>Vendredi</strong> : 18h00 – 21h00
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* LIEU */}
      <section className="bg-gray-50 rounded-lg">
        <div className="px-6 py-10 md:px-12">
          <h2 className="text-2xl font-semibold mb-4">Lieu d’entraînement</h2>

          <p className="text-gray-700 mb-4">
            Les entraînements ont lieu au gymnase de Châlons-en-Champagne.
          </p>

          <p className="text-gray-700">
            <strong>Adresse :</strong> Gymnase – Châlons-en-Champagne
          </p>

          {/* Plus tard : Google Maps */}
          {/* <div className="mt-6 h-64 bg-gray-200 rounded-lg" /> */}
        </div>
      </section>

      {/* ESSAI */}
      <section>
        <div className="border-l-4 border-purple-500 pl-6">
          <h2 className="text-xl font-semibold mb-2">Essai gratuit</h2>
          <p className="text-gray-700 max-w-3xl">
            Les nouveaux joueurs peuvent venir essayer gratuitement avant toute
            inscription. N’hésitez pas à nous contacter pour plus
            d’informations.
          </p>
        </div>
      </section>
    </div>
  );
}
