import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TarifsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Tarifs</h1>
        <p className="text-gray-600 max-w-3xl">
          Retrouvez ci-dessous les tarifs de la cotisation annuelle du
          Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      {/* COTISATIONS */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Cotisations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ADULTES */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>
                Adultes{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (Vétérans & Sénior)
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span>Promotionnelle</span>
                  <strong>140 €</strong>
                </li>
                <li className="flex justify-between font-semibold text-purple-600">
                  <span>Compétition</span>
                  <strong>184 €</strong>
                </li>
                <li className="flex justify-between">
                  <span>Compétition + Critérium Fédéral</span>
                  <strong>226 €</strong>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* JUNIORS */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>
                Juniors{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (2007–2010)
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span>Promotionnelle</span>
                  <strong>140 €</strong>
                </li>
                <li className="flex justify-between font-semibold text-purple-600">
                  <span>Compétition</span>
                  <strong>184 €</strong>
                </li>
                <li className="flex justify-between">
                  <span>Compétition + Critérium Fédéral</span>
                  <strong>207 €</strong>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CADETS & MINIMES */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>
                Cadets & Minimes{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (2011–2014)
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span>Promotionnelle</span>
                  <strong>130 €</strong>
                </li>
                <li className="flex justify-between font-semibold text-purple-600">
                  <span>Compétition</span>
                  <strong>158 €</strong>
                </li>
                <li className="flex justify-between">
                  <span>Compétition + Critérium Fédéral</span>
                  <strong>181 €</strong>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* POUSSINS & BENJAMINS */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>
                Poussins & Benjamins{" "}
                <span className="text-sm text-gray-500 font-normal">
                  (2015 et après)
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span>Promotionnelle</span>
                  <strong>130 €</strong>
                </li>
                <li className="flex justify-between font-semibold text-purple-600">
                  <span>Compétition</span>
                  <strong>158 €</strong>
                </li>
                <li className="flex justify-between">
                  <span>Compétition + Critérium Fédéral</span>
                  <strong>168 €</strong>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MODALITÉS DE PAIEMENT */}
      <section>
        <h2 className="text-2xl font-semibold mb-8">Modalités de paiement</h2>

        <Card className="max-w-4xl border-l-4 border-l-purple-600">
          <CardHeader>
            <CardTitle>Moyens de paiement acceptés</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              <li>Chèque ou numéraire</li>
              <li>Chèques-vacances</li>
              <li>Bons CAF</li>
              <li>Chèques ACTOBI</li>
              <li>MSA</li>
            </ul>

            <div className="space-y-2 text-gray-700">
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

      {/* INCLUS */}
      <section className="bg-gray-50 rounded-lg">
        <div className="px-6 py-10 md:px-12">
          <h2 className="text-2xl font-semibold mb-6">
            La cotisation comprend
          </h2>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>La licence FFTT</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>L’accès aux entraînements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>L’encadrement sportif</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>La participation à la vie du club</span>
            </li>
          </ul>
        </div>
      </section>

      {/* INSCRIPTION */}
      <section>
        <div className="border-l-4 border-purple-500 pl-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">
            Modalités d’inscription
          </h2>
          <p className="text-gray-700 max-w-3xl">
            Pour toute inscription ou demande de renseignement, merci de nous
            contacter. Les tarifs peuvent évoluer selon les catégories et les
            situations particulières.
          </p>
        </div>
        <a
          href="/contact"
          className="inline-flex justify-center border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-50 transition"
        >
          Nous contacter
        </a>
      </section>
    </div>
  );
}
