const partenairesInstitutionnels = [
  { nom: "FFTT", url: "https://www.fftt.com/" },
  { nom: "Ligue Grand Est TT", url: "https://www.lgett.fr/accueil" },
  { nom: "Comité Marne TT", url: "https://cd51tt.fr/" },
  { nom: "Grand Est", url: "https://www.grandest.fr/" },
  { nom: "La Marne", url: "https://www.marne.fr/" },
  {
    nom: "Châlons-en-Champagne",
    url: "https://www.chalonsenchampagne.fr/ville",
  },
];

const partenairesPrives = [
  "Opel Renesson",
  "Colson Boulangerie",
  "Ola Création",
  "Joola",
  "Saint Alp",
];

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
      <section className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Partenaires institutionnels</h2>
          <p className="text-gray-600 max-w-3xl">
            Nos partenaires institutionnels accompagnent le club dans ses
            projets sportifs et associatifs.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partenairesInstitutionnels.map((partenaire) => (
              <a
                key={partenaire.nom}
                className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
                href={partenaire.url}
                target="_blank"
                rel="noreferrer"
              >
                <div>
                  <p className="text-sm text-gray-500">Institutionnel</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {partenaire.nom}
                  </p>
                </div>
                <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
                  Visiter
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Partenaires privés</h2>
          <p className="text-gray-600 max-w-3xl">
            Merci à nos partenaires privés pour leur engagement auprès du club.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partenairesPrives.map((partenaire) => (
              <div
                key={partenaire}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">Partenaire privé</p>
                <p className="text-lg font-semibold text-gray-900">
                  {partenaire}
                </p>
              </div>
            ))}
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
