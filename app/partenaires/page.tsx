export default function PartenairesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Partenaires</h1>
        <p className="text-gray-600 max-w-3xl">
          Le Châlons-en-Champagne Tennis de Table remercie l’ensemble de ses
          partenaires pour leur soutien et leur engagement auprès du club.
        </p>
      </header>

      {/* LISTE PARTENAIRES */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Nos partenaires</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {/* PARTENAIRE */}
          <div className="flex items-center justify-center border rounded-lg p-6 bg-white">
            <span className="text-gray-500 text-sm">Logo partenaire</span>
          </div>

          <div className="flex items-center justify-center border rounded-lg p-6 bg-white">
            <span className="text-gray-500 text-sm">Logo partenaire</span>
          </div>

          <div className="flex items-center justify-center border rounded-lg p-6 bg-white">
            <span className="text-gray-500 text-sm">Logo partenaire</span>
          </div>

          <div className="flex items-center justify-center border rounded-lg p-6 bg-white">
            <span className="text-gray-500 text-sm">Logo partenaire</span>
          </div>
        </div>
      </section>

      {/* TEXTE DE REMERCIEMENT */}
      <section className="bg-gray-50 rounded-lg">
        <div className="px-6 py-10 md:px-12">
          <h2 className="text-2xl font-semibold mb-4">
            Merci à nos partenaires
          </h2>
          <p className="text-gray-700 max-w-4xl leading-relaxed">
            Grâce au soutien de nos partenaires institutionnels et privés, le
            club peut proposer des conditions de pratique de qualité, développer
            ses actions sportives et accompagner ses licenciés tout au long de
            la saison.
          </p>
        </div>
      </section>

      {/* DEVENIR PARTENAIRE */}
      <section>
        <div className="border-l-4 border-purple-500 pl-6">
          <h2 className="text-xl font-semibold mb-2">Devenir partenaire</h2>
          <p className="text-gray-700 max-w-3xl">
            Vous souhaitez soutenir le Châlons-en-Champagne Tennis de Table et
            devenir partenaire du club ? N’hésitez pas à nous contacter pour
            échanger sur les différentes possibilités de partenariat.
          </p>
        </div>
      </section>
    </div>
  );
}
