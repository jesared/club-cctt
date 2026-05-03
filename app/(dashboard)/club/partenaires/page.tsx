import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_LOGO = "/partenaires/default-logo.svg";

type Partenaire = {
  nom: string;
  description: string;
  logo: string;
  url?: string;
};

type PartenairesData = {
  institutionnels: Partenaire[];
  prives: Partenaire[];
};

type PartenairesResponse = {
  data: PartenairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
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
      <div className="flex h-20 w-32 items-center justify-center">
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
        className="group flex flex-col gap-4 rounded-2xl border border-border px-6 py-5 shadow-sm card-hover hover:border-primary/40"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border px-6 py-5 card-hover">
      {content}
    </div>
  );
}

export default async function PartenairesPage() {
  const payload: PartenairesResponse = await getPartenaires();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  const institutionnels = data.institutionnels ?? [];
  const prives = data.prives ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 ">
      <Reveal>
        <header className="rounded-2xl border border-transparent bg-transparent ">
          <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent animate-fade-up-1">
            CCTT / Partners Network
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mb-4 text-4xl font-bold animate-fade-up-2">
              Partenaires
            </h1>
            {formattedUpdatedAt ? (
              <Badge variant={meta.stale ? "secondary" : "outline"}>
                {meta.stale
                  ? `Derniere mise a jour le ${formattedUpdatedAt}`
                  : `Mis a jour le ${formattedUpdatedAt}`}
              </Badge>
            ) : meta.stale ? (
              <Badge variant="secondary">
                Derniere mise a jour indisponible
              </Badge>
            ) : (
              <Badge variant="outline">Mise a jour en cours</Badge>
            )}
          </div>
          <p className="max-w-3xl ">
            Le Chalons-en-Champagne Tennis de Table remercie l&apos;ensemble de ses
            partenaires pour leur soutien et leur engagement aupres du club.
          </p>
        </header>
      </Reveal>

      <section className="space-y-4">
        <Reveal>
          <h2 className="text-2xl font-semibold ">Partenaires institutionnels</h2>
        </Reveal>
        <p className="max-w-3xl ">
          Nos partenaires institutionnels accompagnent le club dans ses projets
          sportifs et associatifs.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutionnels.map((p: Partenaire, index) => (
            <Reveal key={p.nom} delay={index * 120}>
              <CardPartenaire partenaire={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Reveal>
          <h2 className="text-2xl font-semibold ">Partenaires prives</h2>
        </Reveal>
        <p className="max-w-3xl  ">
          Merci a nos partenaires prives pour leur engagement aupres du club.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prives.map((p: Partenaire, index) => (
            <Reveal key={p.nom} delay={index * 120}>
              <CardPartenaire partenaire={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="rounded-lg bg-muted/40 card-hover">
          <div className="px-6 py-8 md:px-12">
            <h2 className="mb-4 text-2xl font-semibold ">
              Merci a nos partenaires
            </h2>
            <p className="max-w-4xl leading-relaxed  ">
              Grace au soutien de nos partenaires institutionnels et prives, le
              club peut proposer des conditions de pratique de qualite,
              developper ses actions sportives et accompagner ses licencies tout
              au long de la saison.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <div className="border-l-4 border-primary pl-6 ">
            <h2 className="mb-2 text-xl font-semibold ">Devenir partenaire</h2>
            <p className="max-w-3xl  ">
              Vous souhaitez soutenir le Chalons-en-Champagne Tennis de Table et
              devenir partenaire du club ? Echangeons sur les possibilites de
              partenariat et les formes de soutien les plus adaptees.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/club/contact">Proposer un partenariat</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/club">Decouvrir le club</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
