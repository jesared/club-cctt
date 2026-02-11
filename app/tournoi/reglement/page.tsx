import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const regles = [
  "Le tournoi est ouvert aux joueurs licenciés FFTT et loisirs selon les tableaux.",
  "Chaque joueur doit se présenter au pointage au moins 30 minutes avant sa série.",
  "Le juge-arbitre se réserve le droit d'adapter les poules selon le nombre d'inscrits.",
  "Le matériel doit être conforme à la réglementation FFTT en vigueur.",
  "Tout comportement anti-sportif peut entraîner une exclusion du tournoi.",
];

export default function ReglementPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Règlement du tournoi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            Ce règlement synthétique encadre le déroulement du Tournoi de
            Pâques. La version complète est disponible sur demande auprès de
            l&apos;organisation.
          </p>

          <ul className="list-disc pl-6 space-y-2">
            {regles.map((regle) => (
              <li key={regle}>{regle}</li>
            ))}
          </ul>

          <a
            href="/tournoi"
            className="inline-flex justify-center border border-purple-600 text-purple-600 px-5 py-2 rounded-md hover:bg-purple-50 transition"
          >
            Retour à la page tournoi
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
