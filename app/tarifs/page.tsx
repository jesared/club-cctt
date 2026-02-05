export default function TarifsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Tarifs</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ci-dessous les tarifs de la cotisation annuelle du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      {/* TARIFS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Cotisations annuelles</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* JEUNES */}
          <div className="border rounded-lg p-6 bg-white text-center">
            <h3 className="text-lg font-semibold mb-2">Jeunes</h3>
            <p className="text-3xl font-bold mb-4">XX €</p>
            <p className="text-sm text-gray-600">Saison sportive</p>
          </div>

          {/* ADULTES LOISIRS */}
          <div className="border rounded-lg p-6 bg-white text-center">
            <h3 className="text-lg font-semibold mb-2">Adultes loisirs</h3>
            <p className="text-3xl font-bold mb-4">XX €</p>
            <p className="text-sm text-gray-600">Saison sportive</p>
          </div>

          {/* COMPÉTITION */}
          <div className="border rounded-lg p-6 bg-white text-center">
            <h3 className="text-lg font-semibold mb-2">Compétition</h3>
            <p className="text-3xl font-bold mb-4">XX €</p>
            <p className="text-sm text-gray-600">Saison sportive</p>
          </div>
        </div>
      </section>

      {/* INCLUS */}
      <section className="bg-gray-50 rounded-lg">
        <div className="px-6 py-10 md:px-12">
          <h2 className="text-2xl font-semibold mb-6">
            La cotisation comprend
          </h2>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>La licence FFTT</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>L’accès aux entraînements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>L’encadrement sportif</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>La participation à la vie du club</span>
            </li>
          </ul>
        </div>
      </section>

      {/* INSCRIPTION */}
      <section>
        <div className="border-l-4 border-purple-500 pl-6">
          <h2 className="text-xl font-semibold mb-2">
            Modalités d’inscription
          </h2>
          <p className="text-gray-700 max-w-3xl">
            Pour toute inscription ou demande de renseignement, merci de nous
            contacter. Les tarifs peuvent évoluer selon les catégories et les
            situations particulières.
          </p>
        </div>
      </section>
    </div>
  );
}
