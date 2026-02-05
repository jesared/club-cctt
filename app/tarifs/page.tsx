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

      {/* COTISATIONS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Cotisations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ADULTES */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Adultes{" "}
              <span className="text-sm text-gray-500">(Vétérans & Sénior)</span>
            </h3>

            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span>Promotionnelle</span>
                <strong>140 €</strong>
              </li>
              <li className="flex justify-between font-semibold text-purple-600">
                <span>Compétition</span>
                <strong>184 €</strong>
              </li>
              <li className="flex justify-between">
                <span>Compétition + Critérium Fédéral</span>
                <strong>226 €</strong>
              </li>
            </ul>
          </div>

          {/* JUNIORS */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Juniors <span className="text-sm text-gray-500">(2007–2010)</span>
            </h3>

            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span>Promotionnelle</span>
                <strong>140 €</strong>
              </li>
              <li className="flex justify-between font-semibold text-purple-600">
                <span>Compétition</span>
                <strong>184 €</strong>
              </li>
              <li className="flex justify-between">
                <span>Compétition + Critérium Fédéral</span>
                <strong>207 €</strong>
              </li>
            </ul>
          </div>

          {/* CADETS & MINIMES */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Cadets & Minimes{" "}
              <span className="text-sm text-gray-500">(2011–2014)</span>
            </h3>

            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span>Promotionnelle</span>
                <strong>130 €</strong>
              </li>
              <li className="flex justify-between font-semibold text-purple-600">
                <span>Compétition</span>
                <strong>158 €</strong>
              </li>
              <li className="flex justify-between">
                <span>Compétition + Critérium Fédéral</span>
                <strong>181 €</strong>
              </li>
            </ul>
          </div>

          {/* POUSSINS & BENJAMINS */}
          <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">
              Poussins & Benjamins{" "}
              <span className="text-sm text-gray-500">(2015 et après)</span>
            </h3>

            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span>Promotionnelle</span>
                <strong>130 €</strong>
              </li>
              <li className="flex justify-between font-semibold text-purple-600">
                <span>Compétition</span>
                <strong>158 €</strong>
              </li>
              <li className="flex justify-between">
                <span>Compétition + Critérium Fédéral</span>
                <strong>168 €</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* MODALITÉS DE PAIEMENT */}
      <section className="bg-gray-50 rounded-lg">
        <div className="px-6 py-10 md:px-12">
          <h2 className="text-2xl font-semibold mb-6">Modalités de paiement</h2>

          <p className="text-gray-700 mb-4">
            Les moyens de paiement suivants sont acceptés :
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <li>Chèque ou numéraire</li>
            <li>Chèques-vacances</li>
            <li>Bons CAF</li>
            <li>Chèques ACTOBI</li>
            <li>MSA</li>
          </ul>

          <div className="mt-6 border-l-4 border-purple-500 pl-6">
            <p className="font-semibold mb-2">PASS SPORT</p>
            <p className="text-gray-700">
              Le dispositif <strong>PASS SPORT</strong> est accepté.
            </p>
          </div>

          <p className="mt-6 text-gray-700">
            Il est également possible de régler la cotisation
            <strong> en plusieurs fois</strong>.
          </p>
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
