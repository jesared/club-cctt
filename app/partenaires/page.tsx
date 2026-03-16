import Image from "next/image";

const DEFAULT_LOGO = "/partenaires/default-logo.svg";

type Partenaire = {
  nom: string;
  description: string;
  logo: string;
  url?: string;
};

async function getPartenaires() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/partenaires`, {
    cache: "no-store",
  });

  return res.json();
}

function CardPartenaire({ partenaire }: { partenaire: Partenaire }) {
  const hasLink = partenaire.url && partenaire.url.trim().length > 0;

  const content = (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-border bg-muted dark:rounded-none dark:border-primary/30 dark:bg-card">
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
        <p className="text-lg font-semibold text-foreground dark:font-mono dark:uppercase dark:tracking-[0.08em]">
          {partenaire.nom}
        </p>
        <p className="text-sm text-muted-foreground dark:text-foreground/65">
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
        className="group flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:rounded-none dark:border-primary/35 dark:bg-card dark:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_16%,transparent)] dark:hover:border-accent/60 dark:hover:shadow-[0_0_28px_color-mix(in_oklab,var(--accent)_20%,transparent)]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm dark:rounded-none dark:border-primary/35 dark:bg-card dark:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
      {content}
    </div>
  );
}

export default async function PartenairesPage() {
  const data = await getPartenaires();

  const institutionnels = data.institutionnels ?? [];
  const prives = data.prives ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 dark:space-y-10">
      <header className="rounded-2xl border border-transparent bg-transparent dark:rounded-none dark:border-primary/35 dark:bg-card dark:px-8 dark:py-8 dark:shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent dark:block">
          CCTT / Partners Network
        </p>
        <h1 className="mb-4 text-4xl font-bold dark:font-mono dark:uppercase dark:tracking-[0.1em] dark:[text-shadow:0_0_15px_color-mix(in_oklab,var(--primary)_42%,transparent)]">
          Partenaires
        </h1>
        <p className="max-w-3xl text-muted-foreground dark:text-foreground/85">
          Le Châlons-en-Champagne Tennis de Table remercie l’ensemble de ses
          partenaires pour leur soutien et leur engagement auprès du club.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
          Partenaires institutionnels
        </h2>
        <p className="max-w-3xl text-gray-600 dark:text-foreground/80">
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
        <h2 className="text-2xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
          Partenaires privés
        </h2>
        <p className="max-w-3xl text-gray-600 dark:text-foreground/80">
          Merci à nos partenaires privés pour leur engagement auprès du club.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prives.map((p: Partenaire) => (
            <CardPartenaire key={p.nom} partenaire={p} />
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-muted/40 dark:rounded-none dark:border dark:border-primary/20 dark:bg-card dark:shadow-[0_0_26px_color-mix(in_oklab,var(--primary)_15%,transparent)]">
        <div className="px-6 py-8 md:px-12">
          <h2 className="mb-4 text-2xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
            Merci à nos partenaires
          </h2>
          <p className="max-w-4xl leading-relaxed text-gray-700 dark:text-foreground/80">
            Grâce au soutien de nos partenaires institutionnels et privés, le
            club peut proposer des conditions de pratique de qualité, développer
            ses actions sportives et accompagner ses licenciés tout au long de
            la saison.
          </p>
        </div>
      </section>

      <section>
        <div className="border-l-4 border-primary pl-6 dark:border-l-accent">
          <h2 className="mb-2 text-xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
            Devenir partenaire
          </h2>
          <p className="max-w-3xl text-gray-700 dark:text-foreground/80">
            Vous souhaitez soutenir le Châlons-en-Champagne Tennis de Table et
            devenir partenaire du club ? Contactez-nous pour échanger sur les
            possibilités de partenariat.
          </p>
        </div>
      </section>
    </div>
  );
}
