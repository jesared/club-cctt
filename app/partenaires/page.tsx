import Image from "next/image";

const DEFAULT_LOGO = "/partenaires/default-logo.svg";

const partenairesInstitutionnels = [
  {
    nom: "FFTT",
    slogan: "La fédération qui fait rayonner le tennis de table.",
    url: "https://www.fftt.com/",
  },
  {
    nom: "Ligue Grand Est TT",
    slogan: "Le ping qui unit tout le Grand Est.",
    url: "https://www.lgett.fr/accueil",
  },
  {
    nom: "Comité Marne TT",
    slogan: "Le ping au cœur de la Marne.",
    url: "https://cd51tt.fr/",
  },
  {
    nom: "Grand Est",
    slogan: "Une région engagée pour le sport.",
    url: "https://www.grandest.fr/",
  },
  {
    nom: "La Marne",
    slogan: "La Marne soutient l’élan sportif.",
    url: "https://www.marne.fr/",
  },
  {
    nom: "Châlons-en-Champagne",
    slogan: "La ville qui encourage le sport de proximité.",
    url: "https://www.chalonsenchampagne.fr/ville",
  },
];

const partenairesPrives = [
  { nom: "Opel Renesson", slogan: " Concessionnaire est un distributeur Opel" },
  { nom: "Colson Boulangerie", slogan: "Le goût du partage, chaque jour." },
  {
    nom: "Ola Création",
    slogan: "L’agence Ola Création : Une passion au service de vos projets",
    logo: "/partenaires/olacreation.png",
    url: "https://olacreation.fr/",
  },
  {
    nom: "Joola",
    slogan: "L’excellence du matériel au service du jeu.",
    logo: "/partenaires/joola.svg",
  },
  {
    nom: "Le Saint Alp'",
    slogan: "Bar - Brasserie",
    logo: "/partenaires/saint-alp.svg",
  },
];

type Partenaire = {
  nom: string;
  slogan: string;
  url?: string;
  logo: string;
  type: "Institutionnel" | "Privé";
};

const getLogoSrc = (logo?: string) =>
  logo && logo.trim().length > 0 ? logo : DEFAULT_LOGO;

const toPartenaire = (
  partenaire: { nom: string; slogan: string; url?: string; logo?: string },
  type: Partenaire["type"],
): Partenaire => ({
  ...partenaire,
  type,
  logo: getLogoSrc(partenaire.logo),
});

export default function PartenairesPage() {
  const institutionnels = partenairesInstitutionnels.map((partenaire) =>
    toPartenaire(partenaire, "Institutionnel"),
  );
  const prives = partenairesPrives.map((partenaire) =>
    toPartenaire(partenaire, "Privé"),
  );

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
          <h2 className="text-2xl font-semibold">
            Partenaires institutionnels
          </h2>
          <p className="text-gray-600 max-w-3xl">
            Nos partenaires institutionnels accompagnent le club dans ses
            projets sportifs et associatifs.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {institutionnels.map((partenaire) => (
              <a
                key={partenaire.nom}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
                href={partenaire.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                    <Image
                      className="max-h-12 max-w-20 object-contain"
                      src={partenaire.logo}
                      alt={`Logo ${partenaire.nom}`}
                      width={80}
                      height={48}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {partenaire.nom}
                    </p>
                    <p className="text-sm text-gray-500">{partenaire.slogan}</p>
                  </div>
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
            {prives.map((partenaire) => {
              const Wrapper = partenaire.url ? "a" : "div";
              return (
                <Wrapper
                  key={partenaire.nom}
                  className={`flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm ${
                    partenaire.url
                      ? "transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
                      : ""
                  }`}
                  href={partenaire.url}
                  target={partenaire.url ? "_blank" : undefined}
                  rel={partenaire.url ? "noreferrer" : undefined}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-gray-100 bg-transparent">
                      <Image
                        className="max-h-12 max-w-20 object-contain"
                        src={partenaire.logo}
                        alt={`Logo ${partenaire.nom}`}
                        width={80}
                        height={48}
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {partenaire.nom}
                      </p>
                      <p className="text-sm text-gray-500">
                        {partenaire.slogan}
                      </p>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
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
