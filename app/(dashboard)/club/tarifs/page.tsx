import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TarifLigne = {
  nom: string;
  prix: string;
  highlight?: boolean;
};

type TarifBloc = {
  categorie: string;
  details?: string;
  lignes: TarifLigne[];
};

type TarifsData = {
  blocs: TarifBloc[];
  paiement: {
    titre: string;
    lignes: string[];
    mentions: string[];
  };
  inclus: string[];
  inscription: {
    titre: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

type TarifsResponse = {
  data: TarifsData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

export default async function TarifsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/tarifs`, {
    cache: "no-store",
  });

  const payload: TarifsResponse = await res.json();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 ">
      <header className="rounded-2xl border border-transparent bg-transparent ">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] ">
          CCTT / Pricing Console
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mb-4 text-4xl font-bold ">Tarifs</h1>
          {formattedUpdatedAt ? (
            <Badge variant={meta.stale ? "secondary" : "outline"}>
              {meta.stale
                ? `Dernière mise à jour le ${formattedUpdatedAt}`
                : `Mis à jour le ${formattedUpdatedAt}`}
            </Badge>
          ) : meta.stale ? (
            <Badge variant="secondary">
              Dernière mise à jour indisponible
            </Badge>
          ) : null}
        </div>
        <p className="max-w-3xl  ">
          Retrouvez ci-dessous les tarifs de la cotisation annuelle du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      <section>
        <h2 className="mb-8 text-2xl font-semibold  ">Cotisations</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {data.blocs.map((bloc) => (
            <Card key={bloc.categorie} className="border-l-4 border-l-primary ">
              <CardHeader>
                <CardTitle>
                  {bloc.categorie}{" "}
                  <span className="text-sm font-normal ">{bloc.details}</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2  ">
                  {bloc.lignes.map((ligne) => (
                    <li
                      key={ligne.nom}
                      className={`flex justify-between ${
                        ligne.highlight ? "font-semibold text-primary " : ""
                      }`}
                    >
                      <span>{ligne.nom}</span>
                      <strong>{ligne.prix}</strong>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-2xl font-semibold ">Modalités de paiement</h2>

        <Card className="max-w-4xl border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>{data.paiement.titre}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 ">
              {data.paiement.lignes.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>

            <div className="space-y-2  ">
              {data.paiement.mentions.map((mention) => (
                <p key={mention}>{mention}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg">
        <div className="px-6 py-8 md:px-12">
          <h2 className="mb-6 text-2xl font-semibold ">
            La cotisation comprend
          </h2>

          <ul className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {data.inclus.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="font-bold text-primary ">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-4 border-l-4 border-primary pl-6 ">
          <h2 className="mb-2 text-xl font-semibold ">{data.inscription.titre}</h2>
          <p className="max-w-3xl">{data.inscription.description}</p>
        </div>
        <a
          href={data.inscription.ctaHref}
          className="inline-flex justify-center rounded-md border border-primary px-6 py-3 text-primary transition hover:bg-muted/40 "
        >
          {data.inscription.ctaLabel}
        </a>
      </section>
    </div>
  );
}

