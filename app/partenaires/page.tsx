import Image from "next/image";

const DEFAULT_LOGO = "/partenaires/default-logo.svg";

type Partenaire = {
  nom: string;
  description: string;
  logo: string;
  url?: string;
};

async function getPartenaires() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/partenaires`,
    { cache: "no-store" },
  );

  return res.json();
}

function CardPartenaire({ partenaire }: { partenaire: Partenaire }) {
  const hasLink = partenaire.url && partenaire.url.trim().length > 0;

  const content = (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
        <Image
          className="max-h-16 max-w-28 object-contain"
          src={
            partenaire.logo && partenaire.logo.trim() !== ""
              ? `/api/drive-image/${partenaire.logo}`
              : "/partenaires/default-logo.svg"
          }
          alt={`Logo ${partenaire.nom}`}
          width={112}
          height={64}
        />
      </div>

      <div>
        <p className="text-lg font-semibold text-gray-900">{partenaire.nom}</p>
        <p className="text-sm text-gray-500">{partenaire.description}</p>
      </div>
    </div>
  );

  // SI il y a un lien → <a>
  if (hasLink) {
    return (
      <a
        href={partenaire.url}
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
      >
        {content}
      </a>
    );
  }

  // SINON → simple div
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      {content}
    </div>
  );
}

export default async function PartenairesPage() {
  const data = await getPartenaires();

  const institutionnels = data.institutionnels ?? [];
  const prives = data.prives ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Partenaires</h1>
        <p className="text-gray-600 max-w-3xl">
          Le Châlons-en-Champagne Tennis de Table remercie l’ensemble de ses
          partenaires pour leur soutien et leur engagement auprès du club.
        </p>
      </header>

      {/* INSTITUTIONNELS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Partenaires institutionnels</h2>
        <p className="text-gray-600 max-w-3xl">
          Nos partenaires institutionnels accompagnent le club dans ses projets
          sportifs et associatifs.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutionnels.map((p: Partenaire) => (
            <CardPartenaire key={p.nom} partenaire={p} />
          ))}
        </div>
      </section>

      {/* PRIVES */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Partenaires privés</h2>
        <p className="text-gray-600 max-w-3xl">
          Merci à nos partenaires privés pour leur engagement auprès du club.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prives.map((p: Partenaire) => (
            <CardPartenaire key={p.nom} partenaire={p} />
          ))}
        </div>
      </section>

      {/* REMERCIEMENT */}
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

      {/* CONTACT */}
      <section>
        <div className="border-l-4 border-purple-500 pl-6">
          <h2 className="text-xl font-semibold mb-2">Devenir partenaire</h2>
          <p className="text-gray-700 max-w-3xl">
            Vous souhaitez soutenir le Châlons-en-Champagne Tennis de Table et
            devenir partenaire du club ? Contactez-nous pour échanger sur les
            possibilités de partenariat.
          </p>
        </div>
      </section>
    </div>
  );
}
