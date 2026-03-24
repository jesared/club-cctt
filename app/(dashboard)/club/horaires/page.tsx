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

type HorairesResponse = {
  data: HorairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

/* ---------- PAGE ---------- */

export default async function HorairesPage() {
  // récupération des données depuis ton API (qui lit Google Drive)
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
      {/* TITRE */}
      <header className="space-y-4 rounded-2xl border border-transparent bg-transparent ">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent ">
          CCTT / Training Matrix
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold mb-2">Horaires d’entraînement</h1>
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

        <p className=" max-w-3xl ">
          Retrouvez ci-dessous l’ensemble des créneaux d’entraînement du
          Châlons-en-Champagne Tennis de Table.
        </p>

        <div className="text-sm  max-w-3xl space-y-2">
          <p>
            Ces horaires sont donnés à titre indicatif. Ils peuvent évoluer
            pendant les vacances scolaires ou lors des jours fériés.
          </p>
          <p>
            Pour toute question,{" "}
            <Link className="text-link hover:underline" href="/contact">
              contactez-nous
            </Link>
            .
          </p>
        </div>
      </header>

      {/* HORAIRES */}
      <section className="space-y-8">
        {/* LÉGENDE */}
        <Card className="bg-transparent border border-transparent">
          <CardHeader>
            <CardTitle>Légende</CardTitle>
          </CardHeader>

          <CardContent className="text-sm ">
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
            <Card key={jour.jour} className="">
              <CardHeader>
                <CardTitle>{jour.jour}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
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
      <Card className="border-l-4 border-l-primary ">
        <CardHeader>
          <CardTitle>Essai gratuit</CardTitle>
        </CardHeader>

        <CardContent>
          <p className=" max-w-3xl mb-3">
            Les nouveaux joueurs peuvent venir essayer gratuitement avant toute
            inscription.
          </p>

          <Link
            href="/contact"
            className="text-link font-medium hover:underline "
          >
            Demander un essai gratuit
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
