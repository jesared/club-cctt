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

/* ---------- PAGE ---------- */

export default async function ComiteDirecteurPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/comite`, {
    cache: "no-store",
  });

  const data: ComiteData = await res.json();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
      {/* TITRE */}
      <header className="rounded-xl border bg-card/70 p-8 shadow-sm dark:rounded-none dark:border-primary/45 dark:bg-[linear-gradient(150deg,color-mix(in_oklab,var(--card)_90%,black),color-mix(in_oklab,var(--primary)_14%,var(--card)))] dark:shadow-[0_0_26px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
        <p className="mb-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary dark:font-mono dark:text-accent">
          Gouvernance CCTT
        </p>
        <h1 className="text-4xl font-bold mb-4 dark:font-mono dark:uppercase dark:tracking-[0.08em]">Comité directeur</h1>
        <p className="text-gray-600 max-w-3xl dark:text-foreground/80">
          Le comité directeur du Châlons-en-Champagne Tennis de Table assure la
          gestion, l’organisation et le développement du club.
        </p>
      </header>

      {/* BUREAU */}
      <section>
        <h2 className="text-3xl font-semibold mb-10 dark:font-mono dark:uppercase dark:tracking-[0.08em]">Bureau</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.bureau.map((personne) => (
            <Card key={personne.nom} className="border-l-4 border-l-purple-500 dark:rounded-none dark:border-primary/45 dark:border-l-primary dark:bg-card/90 dark:shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_18%,transparent)]">
              <CardHeader className="flex flex-col items-center text-center gap-4">
                <div className="relative w-28 h-28 overflow-hidden rounded-lg dark:rounded-none dark:border dark:border-primary/45">
                  <Image
                    src={personne.photo}
                    alt={`${personne.nom} – ${personne.poste}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.06em]">{personne.poste}</CardTitle>
              </CardHeader>

              <CardContent className="text-center">
                <p className="font-medium">{personne.nom}</p>
                <p className="text-sm text-gray-500 dark:text-foreground/70">{personne.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* MEMBRES */}
      <section>
        <h2 className="text-3xl font-semibold mb-10 dark:font-mono dark:uppercase dark:tracking-[0.08em]">Membres du comité</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.membres.map((membre) => (
            <Card key={membre.nom} className="dark:rounded-none dark:border-primary/45 dark:bg-card/90 dark:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
              <CardHeader className="flex flex-row items-center gap-3">
                <Users className="w-5 h-5 text-purple-600 dark:text-accent" />
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
        <h2 className="text-3xl font-semibold mb-10 dark:font-mono dark:uppercase dark:tracking-[0.08em]">Salariés diplômés</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.salaries.map((salarie) => (
            <Card key={salarie.nom} className="dark:rounded-none dark:border-primary/45 dark:bg-card/90 dark:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_16%,transparent)]">
              <CardHeader className="flex flex-row items-center gap-3">
                <Users className="w-5 h-5 text-purple-600 dark:text-accent" />
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
