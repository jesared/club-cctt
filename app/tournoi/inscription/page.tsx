import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Card className="shadow-sm border-border tournament-panel">
        <CardHeader className="space-y-3">
          <CardTitle>Inscription au Tournoi de Pâques 2026</CardTitle>
          <p className="text-gray-700">
            Complétez ce formulaire pour envoyer votre demande d&apos;inscription.
            Une confirmation vous sera transmise après vérification des places
            disponibles dans les tableaux sélectionnés.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <TournamentRegistrationForm />
          <div className="rounded-lg bg-purple-50 border border-purple-100 p-4 text-sm text-purple-900">
            <p>
              <strong>Besoin d&apos;aide&nbsp;?</strong> Contact inscriptions :
              {" "}
              <a className="underline" href="mailto:inscriptions-tournoi@cctt.fr">
                inscriptions-tournoi@cctt.fr
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/tournoi"
              className="inline-flex justify-center rounded-md border border-primary px-5 py-2 text-primary transition hover:bg-primary/10"
            >
              Retour à la page tournoi
            </a>
            <a
              href="/tournoi/mes-inscriptions"
              className="inline-flex justify-center rounded-md border border-border px-5 py-2 text-foreground transition hover:bg-accent/40"
            >
              Voir mes inscriptions
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
