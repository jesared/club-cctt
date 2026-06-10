import Reveal from "@/components/Reveal";
import ClubContextNav from "@/components/public/club-context-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TarifsResponse } from "@/lib/tarifs-content";
import { Activity, Clock, IdCard } from "lucide-react";
import Link from "next/link";

const profileGuides = [
  {
    title: "Je découvre le club",
    detail:
      "Commencez par repérer la formule qui correspond à votre pratique, puis utilisez le contact si vous avez un doute avant inscription.",
  },
  {
    title: "Je joue déjà régulièrement",
    detail:
      "Comparez surtout la catégorie, le volume d'entraînement et les éléments inclus dans la cotisation annuelle.",
  },
  {
    title: "Je veux un budget clair",
    detail:
      "Regardez d'abord la cotisation, puis les modalités de paiement et la FAQ pour anticiper les cas particuliers.",
  },
];

export default async function TarifsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/tarifs`, {
    cache: "no-store",
  });

  const payload: TarifsResponse = await res.json();
  const { data, meta } = payload;
  const primaryCtaHref =
    data.inscription.ctaHref === "/contact"
      ? "/club/contact"
      : data.inscription.ctaHref;
  const showContactSecondaryCta = primaryCtaHref !== "/club/contact";
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;
  const primaryCtaLabel =
    primaryCtaHref === "/club"
      ? "Découvrir le club"
      : primaryCtaHref === "/club/horaires"
        ? "Voir les horaires"
        : primaryCtaHref === "/club/tarifs"
          ? "Voir les tarifs"
          : primaryCtaHref === "/club/contact"
            ? "Contacter le club"
            : primaryCtaHref === "/tournoi/inscription"
              ? "S'inscrire au tournoi"
              : data.inscription.ctaLabel;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <Reveal>
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold">Tarifs</h1>
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

          <div className="max-w-4xl space-y-3">
            <p className="text-lg text-foreground">
              Quel tarif pour quel profil ?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cette page vous aide à lire les cotisations comme une décision
              simple : choisir la bonne formule, comprendre ce qui est inclus
              et savoir comment régler sans mauvaise surprise.
            </p>
          </div>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <ClubContextNav />
      </Reveal>

      <section className="grid gap-4 lg:grid-cols-3">
        {profileGuides.map((item, index) => (
          <Reveal key={item.title} delay={index * 100}>
            <Card className="border-border bg-card shadow-sm card-hover">
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>

      <section className="space-y-8">
        <Reveal>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Cotisations</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Parcourez les formules par catégorie, puis regardez la ligne la
              plus proche de votre situation.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {data.blocs.map((bloc, index) => (
            <Reveal key={bloc.categorie} delay={index * 120}>
              <Card className="border-l-4 border-l-primary card-hover">
                <CardHeader className="space-y-2">
                  <CardTitle>{bloc.categorie}</CardTitle>
                  {bloc.details ? (
                    <p className="text-sm text-muted-foreground">{bloc.details}</p>
                  ) : null}
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {bloc.lignes.map((ligne) => (
                      <li
                        key={ligne.nom}
                        className={`flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/80 px-4 py-3 ${
                          ligne.highlight ? "text-primary" : ""
                        }`}
                      >
                        <span className={ligne.highlight ? "font-semibold" : ""}>
                          {ligne.nom}
                        </span>
                        <strong className="shrink-0">{ligne.prix}</strong>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Reveal>
          <Card className="border-l-4 border-l-primary card-hover">
            <CardHeader>
              <CardTitle>{data.paiement.titre}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {data.paiement.lignes.map((ligne) => (
                  <Badge key={ligne} variant="secondary" className="px-3 py-1">
                    {ligne}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {data.paiement.mentions.map((mention) => (
                  <p key={mention}>{mention}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card className="border-l-4 border-l-primary card-hover">
            <CardHeader>
              <CardTitle>Ce que vous payez vraiment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Une cotisation annuelle plutôt qu&apos;une addition de frais cachés.</p>
              <p>Une lecture claire de ce qui est inclus dans la pratique.</p>
              <p>Des solutions de règlement à discuter avec le club si besoin.</p>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="rounded-lg">
        <Reveal>
          <div className="px-6 py-8 md:px-12">
            <h2 className="mb-3 text-2xl font-semibold">
              La cotisation comprend
            </h2>
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Voici ce qui est déjà inclus dans la formule annuelle, pour mieux
              comparer les offres sans supposer qu&apos;il faudra ajouter autre
              chose ensuite.
            </p>

            <ul className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {data.inclus.map((item, index) => {
                const label = item.toLowerCase();
                const Icon =
                  label.includes("licence") || label.includes("licence fftt")
                    ? IdCard
                    : label.includes("créneau") ||
                        label.includes("créneau") ||
                        label.includes("entraînement") ||
                        label.includes("entrainement")
                      ? Clock
                      : Activity;

                return (
                  <Reveal key={item} delay={index * 80}>
                    <li className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
                      <span className="mt-0.5 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2 className="mb-6 text-2xl font-semibold">FAQ</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Peut-on payer en plusieurs fois ?",
              content:
                "Oui, contactez-nous pour mettre en place un règlement échelonné.",
            },
            {
              title: "Licence incluse ?",
              content:
                "Oui, la cotisation inclut la licence FFTT selon la formule choisie.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.content}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-background to-background card-hover">
            <CardContent className="space-y-6 px-6 py-8 md:px-10">
              <div className="border-l-4 border-primary pl-6">
                <h2 className="mb-2 text-xl font-semibold">
                  {data.inscription.titre}
                </h2>
                <p className="max-w-3xl text-muted-foreground">
                  {data.inscription.description}
                </p>
              </div>

              <div
                className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-background/70 p-1 sm:w-fit sm:flex-row"
                role="group"
                aria-label="Actions inscription"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-10 rounded-md shadow-none"
                >
                  <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
                </Button>
                {showContactSecondaryCta ? (
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10 rounded-md shadow-none"
                  >
                    <Link href="/club/contact">Contacter le club</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10 rounded-md shadow-none"
                  >
                    <Link href="/club/horaires">Voir les horaires</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
