import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Reveal from "@/components/Reveal";
import Link from "next/link";

type BadgeVariant = "jeunes" | "elite" | "loisir" | "libre";

type Seance = {
  type: BadgeVariant[];
  label: string;
  horaire: string;
};

type Jour = {
  jour: string;
  seances: Seance[];
};

type HorairesData = {
  jours: Jour[];
};

type HorairesResponse = {
  data: HorairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

export default async function HorairesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/horaires`, {
    cache: "no-store",
  });

  const payload: HorairesResponse = await res.json();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 ">
      <Reveal>
        <header className="space-y-4 rounded-2xl border border-transparent bg-transparent ">
          <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent animate-fade-up-1">
            CCTT / Training Matrix
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold mb-2 animate-fade-up-2">
              Horaires d&apos;entrainement
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
            Retrouvez ci-dessous l&apos;ensemble des creneaux d&apos;entrainement du
            Chalons-en-Champagne Tennis de Table.
          </p>

          <div className="max-w-3xl space-y-2 text-sm">
            <p>
              Ces horaires sont donnes a titre indicatif. Ils peuvent evoluer
              pendant les vacances scolaires ou lors des jours feries.
            </p>
            <p>
              Les ajustements ponctuels sont communiques par le club selon le
              calendrier de la saison.
            </p>
          </div>
        </header>
      </Reveal>

      <section className="space-y-8">
        <Reveal>
          <Card className="bg-transparent border border-transparent card-hover">
            <CardHeader>
              <CardTitle>Legende</CardTitle>
            </CardHeader>

            <CardContent className="text-sm ">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="jeunes">Jeunes</Badge>
                  <span>Entrainements encadres pour les jeunes</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="elite">Elite</Badge>
                  <span>Groupes a niveau confirme</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="loisir">Loisir</Badge>
                  <span>Pratique loisir et sport sante</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="libre">Libre</Badge>
                  <span>Jeu libre reserve aux licencies</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.jours.map((jour, index) => (
            <Reveal key={jour.jour} delay={index * 120}>
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>{jour.jour}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {jour.seances.map((seance, i) => (
                      <li key={i} className="flex items-center gap-2 flex-wrap">
                        {seance.type.map((t) => (
                          <Badge key={t} variant={t}>
                            {t === "jeunes"
                              ? "Jeunes"
                              : t === "elite"
                                ? "Elite"
                                : t === "loisir"
                                  ? "Loisir"
                                  : "Libre"}
                          </Badge>
                        ))}

                        <span>
                          {seance.horaire}
                          {seance.label && ` (${seance.label})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <Card className="border-l-4 border-l-primary card-hover">
          <CardHeader>
            <CardTitle>Essai gratuit</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="max-w-3xl">
              Les nouveaux joueurs peuvent venir essayer gratuitement avant
              toute inscription.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/club/contact">Demander un essai gratuit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/club/tarifs">Voir les cotisations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
