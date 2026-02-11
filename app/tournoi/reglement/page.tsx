import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pointsCles = [
  "Le tournoi est ouvert aux licenciés FFTT et suit les règles sportives fédérales en vigueur.",
  "Chaque joueur doit être pointé avant son tableau ; tout retard peut entraîner la perte de la place dans le tableau.",
  "Le juge-arbitre est seul décisionnaire sur l'organisation sportive (formule, placements, horaires, enchaînement des matchs).",
  "Le matériel utilisé doit être conforme à la réglementation FFTT (raquette, tenue sportive et conditions de jeu).",
  "En cas d'attitude anti-sportive, l'organisation se réserve le droit de sanctionner ou d'exclure un participant.",
];

export default function ReglementPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Règlement du tournoi 2026 (synthèse)</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 text-gray-700">
          <p>
            Cette page reprend les points essentiels du règlement 2026 pour vous
            aider à préparer votre participation. Les modalités détaillées
            (tableaux, horaires exacts, droits d&apos;engagement et cas
            particuliers) restent celles du document officiel de l&apos;organisation.
          </p>

          <ul className="list-disc pl-6 space-y-2">
            {pointsCles.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <p>
            Règlement complet :{" "}
            <a
              href="https://tournoi.cctt.fr/wp-content/uploads/2026/01/reglement-tournoi-2026-ffttv2.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline hover:text-purple-900"
            >
              consulter le document officiel 2026
            </a>
            .
          </p>

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
