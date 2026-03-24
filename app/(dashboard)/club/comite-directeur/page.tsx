import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Image from "next/image";

/* ---------- TYPES ---------- */

type BureauMember = {
  poste: string;
  nom: string;
  description: string;
  photo: string;
};

type SimpleMember = {
  nom: string;
};

type ComiteData = {
  bureau: BureauMember[];
  membres: SimpleMember[];
  salaries: SimpleMember[];
};

type ComiteResponse = {
  data: ComiteData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

/* ---------- PAGE ---------- */

export default async function ComiteDirecteurPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/comite`, {
    cache: "no-store",
  });

  const payload: ComiteResponse = await res.json();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
      {/* TITRE */}
      <header className="rounded-xl border bg-card/70 p-8 shadow-sm ">
        <p className="mb-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]  ">
          Gouvernance CCTT
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold mb-4 ">Comité directeur</h1>
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
          Le comité directeur du Châlons-en-Champagne Tennis de Table assure la
          gestion, l’organisation et le développement du club.
        </p>
      </header>

      {/* BUREAU */}
      <section>
        <h2 className="text-3xl font-semibold mb-8">Bureau</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.bureau.map((personne) => (
            <Card key={personne.nom} className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-col items-center text-center gap-4">
                <div className="relative w-28 h-28 overflow-hidden rounded-lg ">
                  <Image
                    src={personne.photo}
                    alt={`${personne.nom} – ${personne.poste}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardTitle className="">{personne.poste}</CardTitle>
              </CardHeader>

              <CardContent className="text-center">
                <p className="font-medium">{personne.nom}</p>
                <p className="text-sm text-gray-500 ">{personne.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* MEMBRES */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 ">Membres du comité</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.membres.map((membre) => (
            <Card key={membre.nom} className="">
              <CardHeader className="flex flex-row items-center gap-3">
                <Users className="w-5 h-5 text-primary " />
                <CardTitle>Membre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{membre.nom}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SALARIÉS */}
      <section>
        <h2 className="text-3xl font-semibold mb-8 ">Salariés diplômés</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.salaries.map((salarie) => (
            <Card key={salarie.nom}>
              <CardHeader className="flex flex-row items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Salarié diplômé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{salarie.nom}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
