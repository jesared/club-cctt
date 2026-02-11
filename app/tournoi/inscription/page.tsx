import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Inscriptions au Tournoi de Pâques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            Les inscriptions sont ouvertes jusqu&apos;au <strong>10 avril 2026</strong>,
            sous réserve de places disponibles.
          </p>
          <p>
            Merci d&apos;indiquer le nom du joueur, le numéro de licence FFTT,
            la(les) catégorie(s) choisie(s) et un contact email.
          </p>
          <p>
            <strong>Par email :</strong> inscriptions-tournoi@cctt.fr
          </p>
          <p>
            <strong>Confirmation :</strong> un email récapitulatif vous sera
            envoyé sous 48h.
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
