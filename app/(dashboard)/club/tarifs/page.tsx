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
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 ">
      <header className="rounded-2xl border border-transparent bg-transparent ">
        <p className="hidden text-xs font-mono uppercase tracking-[0.2em] ">
          CCTT / Pricing Console
        </p>
        <h1 className="mb-4 text-4xl font-bold ">Tarifs</h1>
        <p className="max-w-3xl  ">
          Retrouvez ci-dessous les tarifs de la cotisation annuelle du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      <section>
        <h2 className="mb-8 text-2xl font-semibold  ">Cotisations</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {tarifs.map((bloc) => (
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
            <CardTitle>Moyens de paiement acceptés</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 ">
              <li>Chèque ou numéraire</li>
              <li>Chèques-vacances</li>
              <li>Bons CAF</li>
              <li>Chèques ACTOBI</li>
              <li>MSA</li>
            </ul>

            <div className="space-y-2  ">
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

      <section className="rounded-lg">
        <div className="px-6 py-8 md:px-12">
          <h2 className="mb-6 text-2xl font-semibold ">
            La cotisation comprend
          </h2>

          <ul className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary ">•</span>
              <span>La licence FFTT</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary ">•</span>
              <span>L’accès aux entraînements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary ">•</span>
              <span>L’encadrement sportif</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary ">•</span>
              <span>La participation à la vie du club</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-4 border-l-4 border-primary pl-6 ">
          <h2 className="mb-2 text-xl font-semibold ">
            Modalités d’inscription
          </h2>
          <p className="max-w-3xl">
            Pour toute inscription ou demande de renseignement, merci de nous
            contacter. Les tarifs peuvent évoluer selon les catégories et les
            situations particulières.
          </p>
        </div>
        <a
          href="/contact"
          className="inline-flex justify-center rounded-md border border-primary px-6 py-3 text-primary transition hover:bg-muted/40 "
        >
          Nous contacter
        </a>
      </section>
    </div>
  );
}
