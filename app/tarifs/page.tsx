import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tarifs = [
  {
    categorie: "Adultes",
    details: "(Vétérans & Sénior)",
    lignes: [
      { nom: "Promotionnelle", prix: "140 €" },
      { nom: "Compétition", prix: "184 €", highlight: true },
      { nom: "Compétition + Critérium Fédéral", prix: "226 €" },
    ],
  },
  {
    categorie: "Juniors",
    details: "(2007–2010)",
    lignes: [
      { nom: "Promotionnelle", prix: "140 €" },
      { nom: "Compétition", prix: "184 €", highlight: true },
      { nom: "Compétition + Critérium Fédéral", prix: "207 €" },
    ],
  },
  {
    categorie: "Cadets & Minimes",
    details: "(2011–2014)",
    lignes: [
      { nom: "Promotionnelle", prix: "130 €" },
      { nom: "Compétition", prix: "158 €", highlight: true },
      { nom: "Compétition + Critérium Fédéral", prix: "181 €" },
    ],
  },
  {
    categorie: "Poussins & Benjamins",
    details: "(2015 et après)",
    lignes: [
      { nom: "Promotionnelle", prix: "130 €" },
      { nom: "Compétition", prix: "158 €", highlight: true },
      { nom: "Compétition + Critérium Fédéral", prix: "168 €" },
    ],
  },
];

export default function TarifsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16 dark:space-y-12">
      <header className="rounded-2xl border border-transparent bg-transparent dark:rounded-none dark:border-primary/35 dark:bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_88%,black),color-mix(in_oklab,var(--card)_70%,black))] dark:px-8 dark:py-10 dark:shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] text-accent dark:block">
          CCTT / Pricing Console
        </p>
        <h1 className="mb-4 text-4xl font-bold dark:font-mono dark:uppercase dark:tracking-[0.1em] dark:[text-shadow:0_0_15px_color-mix(in_oklab,var(--primary)_42%,transparent)]">
          Tarifs
        </h1>
        <p className="max-w-3xl text-gray-600 dark:text-foreground/85">
          Retrouvez ci-dessous les tarifs de la cotisation annuelle du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      <section>
        <h2 className="mb-8 text-2xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
          Cotisations
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {tarifs.map((bloc) => (
            <Card
              key={bloc.categorie}
              className="border-l-4 border-l-purple-500 dark:rounded-none dark:border-l-accent dark:border-y-primary/25 dark:border-r-primary/25 dark:bg-[linear-gradient(140deg,color-mix(in_oklab,var(--card)_92%,black),color-mix(in_oklab,var(--card)_74%,black))] dark:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
            >
              <CardHeader>
                <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.08em]">
                  {bloc.categorie}{" "}
                  <span className="text-sm font-normal text-gray-500 dark:text-foreground/60">
                    {bloc.details}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-gray-700 dark:text-foreground/80">
                  {bloc.lignes.map((ligne) => (
                    <li
                      key={ligne.nom}
                      className={`flex justify-between ${
                        ligne.highlight
                          ? "font-semibold text-purple-600 dark:text-accent"
                          : ""
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
        <h2 className="mb-8 text-2xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
          Modalités de paiement
        </h2>

        <Card className="max-w-4xl border-l-4 border-l-purple-600 dark:rounded-none dark:border-l-accent dark:border-y-primary/20 dark:border-r-primary/20 dark:bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_92%,black),color-mix(in_oklab,var(--card)_80%,black))] dark:shadow-[0_0_22px_color-mix(in_oklab,var(--accent)_16%,transparent)]">
          <CardHeader>
            <CardTitle className="dark:font-mono dark:uppercase dark:tracking-[0.08em]">
              Moyens de paiement acceptés
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="grid grid-cols-1 gap-2 text-gray-700 sm:grid-cols-2 dark:text-foreground/80">
              <li>Chèque ou numéraire</li>
              <li>Chèques-vacances</li>
              <li>Bons CAF</li>
              <li>Chèques ACTOBI</li>
              <li>MSA</li>
            </ul>

            <div className="space-y-2 text-gray-700 dark:text-foreground/80">
              <p>
                <strong>PASS SPORT :</strong> le dispositif PASS SPORT est
                accepté par le club.
              </p>

              <p>
                Possibilité de régler la cotisation
                <strong> en plusieurs fois</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg bg-gray-50 dark:rounded-none dark:border dark:border-primary/20 dark:bg-[linear-gradient(140deg,color-mix(in_oklab,var(--card)_90%,black),color-mix(in_oklab,var(--card)_78%,black))] dark:shadow-[0_0_26px_color-mix(in_oklab,var(--primary)_15%,transparent)]">
        <div className="px-6 py-10 md:px-12">
          <h2 className="mb-6 text-2xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
            La cotisation comprend
          </h2>

          <ul className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 dark:text-accent">•</span>
              <span>La licence FFTT</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 dark:text-accent">•</span>
              <span>L’accès aux entraînements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 dark:text-accent">•</span>
              <span>L’encadrement sportif</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 dark:text-accent">•</span>
              <span>La participation à la vie du club</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-4 border-l-4 border-purple-500 pl-6 dark:border-l-accent">
          <h2 className="mb-2 text-xl font-semibold dark:font-mono dark:uppercase dark:tracking-[0.08em]">
            Modalités d’inscription
          </h2>
          <p className="max-w-3xl text-gray-700 dark:text-foreground/80">
            Pour toute inscription ou demande de renseignement, merci de nous
            contacter. Les tarifs peuvent évoluer selon les catégories et les
            situations particulières.
          </p>
        </div>
        <a
          href="/contact"
          className="inline-flex justify-center rounded-md border border-purple-600 px-6 py-3 text-purple-600 transition hover:bg-purple-50 dark:rounded-none dark:border-accent dark:px-7 dark:font-mono dark:uppercase dark:tracking-[0.1em] dark:text-accent dark:hover:bg-accent/10"
        >
          Nous contacter
        </a>
      </section>
    </div>
  );
}
