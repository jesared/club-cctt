import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

/* ---------- TYPES ---------- */
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

/* ---------- PAGE ---------- */

export default async function HorairesPage() {
  // récupération des données depuis ton API (qui lit Google Drive)
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/horaires`, {
    cache: "no-store",
  });

  const data: HorairesData = await res.json();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16 dark:space-y-12">
      {/* TITRE */}
      <header className="space-y-4 rounded-2xl border border-transparent bg-transparent dark:rounded-none dark:border-primary/35 dark:bg-[linear-gradient(140deg,color-mix(in_oklab,var(--card)_88%,black),color-mix(in_oklab,var(--card)_72%,black))] dark:px-8 dark:py-10 dark:shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent dark:block">
          CCTT / Training Matrix
        </p>
        <h1 className="text-4xl font-bold mb-2 dark:font-mono dark:uppercase dark:tracking-[0.1em] dark:[text-shadow:0_0_15px_color-mix(in_oklab,var(--primary)_40%,transparent)]">
          Horaires d’entraînement
        </h1>

        <p className="text-gray-600 max-w-3xl dark:text-foreground/85">
          Retrouvez ci-dessous l’ensemble des créneaux d’entraînement du
          Châlons-en-Champagne Tennis de Table.
        </p>

        <div className="text-sm text-gray-500 max-w-3xl space-y-2">
          <p>
            Ces horaires sont donnés à titre indicatif. Ils peuvent évoluer
            pendant les vacances scolaires ou lors des jours fériés.
          </p>
          <p>
            Pour toute question,{" "}
            <Link className="text-purple-600 hover:underline" href="/contact">
              contactez-nous
            </Link>
            .
          </p>
        </div>
      </header>

      {/* HORAIRES */}
      <section className="space-y-8">
        {/* LÉGENDE */}
        <Card className="bg-gray-50 dark:rounded-none dark:border-primary/35 dark:bg-[linear-gradient(120deg,color-mix(in_oklab,var(--card)_90%,black),color-mix(in_oklab,var(--card)_76%,black))] dark:shadow-[0_0_20px_color-mix(in_oklab,var(--accent)_14%,transparent)]">
          <CardHeader>
            <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.1em]">
              Légende
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm text-gray-700">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="jeunes">Jeunes</Badge>
                <span>Entraînements encadrés pour les jeunes</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="elite">Élite</Badge>
                <span>Groupes à niveau confirmé</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="loisir">Loisir</Badge>
                <span>Pratique loisir et sport santé</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="libre">Libre</Badge>
                <span>Jeu libre réservé aux licenciés</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JOURS DYNAMIQUES */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.jours.map((jour) => (
            <Card
              key={jour.jour}
              className="dark:rounded-none dark:border-primary/35 dark:bg-[linear-gradient(140deg,color-mix(in_oklab,var(--card)_95%,black),color-mix(in_oklab,var(--card)_74%,black))] dark:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_15%,transparent)]"
            >
              <CardHeader>
                <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.12em]">
                  {jour.jour}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {jour.seances.map((seance, i) => (
                    <li key={i} className="flex items-center gap-2 flex-wrap">
                      {/* Badges */}
                      {seance.type.map((t) => (
                        <Badge key={t} variant={t}>
                          {t === "jeunes"
                            ? "Jeunes"
                            : t === "elite"
                              ? "Élite"
                              : t === "loisir"
                                ? "Loisir"
                                : "Libre"}
                        </Badge>
                      ))}

                      {/* Horaire + label */}
                      <span>
                        {seance.horaire}
                        {seance.label && ` (${seance.label})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ESSAI */}
      <Card className="border-l-4 border-l-purple-500 dark:rounded-none dark:border-l-accent dark:border-y-accent/20 dark:border-r-accent/20 dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--card)_88%,black),color-mix(in_oklab,var(--accent)_10%,var(--card)))] dark:shadow-[0_0_30px_color-mix(in_oklab,var(--accent)_20%,transparent)]">
        <CardHeader>
          <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.08em]">
            Essai gratuit
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-gray-700 max-w-3xl mb-3">
            Les nouveaux joueurs peuvent venir essayer gratuitement avant toute
            inscription.
          </p>

          <Link
            href="/contact"
            className="text-purple-600 font-medium hover:underline dark:text-accent"
          >
            Demander un essai gratuit
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
