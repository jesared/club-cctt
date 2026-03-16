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
    {
      cache: "no-store",
    },
  );

  return res.json();
}

function CardPartenaire({ partenaire }: { partenaire: Partenaire }) {
  const hasLink = partenaire.url && partenaire.url.trim().length > 0;

  const content = (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-32 items-center justify-center   ">
        <Image
          className="max-h-16 max-w-28 object-contain"
          src={
            partenaire.logo && partenaire.logo.trim() !== ""
              ? `/api/drive-image/${partenaire.logo}`
              : DEFAULT_LOGO
          }
          alt={`Logo ${partenaire.nom}`}
          width={112}
          height={64}
        />
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground ">
          {partenaire.nom}
        </p>
        <p className="text-sm text-muted-foreground ">
          {partenaire.description}
        </p>
      </div>
    </div>
  );

  if (hasLink) {
    return (
      <a
        href={partenaire.url}
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col gap-4 rounded-2xl border border-border  px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md "
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border px-6 py-5 ">
      {content}
    </div>
  );
}

export default async function PartenairesPage() {
  const data = await getPartenaires();

  const institutionnels = data.institutionnels ?? [];
  const prives = data.prives ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 ">
      <header className="rounded-2xl border border-transparent bg-transparent ">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent ">
          CCTT / Partners Network
        </p>
        <h1 className="mb-4 text-4xl font-bold  ">Partenaires</h1>
        <p className="max-w-3xl ">
          Le Châlons-en-Champagne Tennis de Table remercie l’ensemble de ses
          partenaires pour leur soutien et leur engagement auprès du club.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold ">Partenaires institutionnels</h2>
        <p className="max-w-3xl ">
          Nos partenaires institutionnels accompagnent le club dans ses projets
          sportifs et associatifs.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutionnels.map((p: Partenaire) => (
            <CardPartenaire key={p.nom} partenaire={p} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold ">Partenaires privés</h2>
        <p className="max-w-3xl  ">
          Merci à nos partenaires privés pour leur engagement auprès du club.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prives.map((p: Partenaire) => (
            <CardPartenaire key={p.nom} partenaire={p} />
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-muted/40 ">
        <div className="px-6 py-8 md:px-12">
          <h2 className="mb-4 text-2xl font-semibold ">
            Merci à nos partenaires
          </h2>
          <p className="max-w-4xl leading-relaxed  ">
            Grâce au soutien de nos partenaires institutionnels et privés, le
            club peut proposer des conditions de pratique de qualité, développer
            ses actions sportives et accompagner ses licenciés tout au long de
            la saison.
          </p>
        </div>
      </section>

      <section>
        <div className="border-l-4 border-primary pl-6 ">
          <h2 className="mb-2 text-xl font-semibold ">Devenir partenaire</h2>
          <p className="max-w-3xl  ">
            Vous souhaitez soutenir le Châlons-en-Champagne Tennis de Table et
            devenir partenaire du club ? Contactez-nous pour échanger sur les
            possibilités de partenariat.
          </p>
        </div>
      </section>
    </div>
  );
}
