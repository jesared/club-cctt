import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Inscriptions au Tournoi de Pâques 2026</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            Les inscriptions se font dans la limite des places disponibles par
            tableau, selon les critères et priorités précisés dans le règlement
            officiel 2026.
          </p>
          <p>
            Merci d&apos;indiquer le nom et prénom du joueur, son numéro de licence
            (ou statut), ses tableaux souhaités et un contact email/téléphone.
          </p>
          <p>
            <strong>Contact inscriptions :</strong> inscriptions-tournoi@cctt.fr
          </p>
          <p>
            <strong>Validation :</strong> l&apos;inscription devient effective après
            confirmation par l&apos;organisation.
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
