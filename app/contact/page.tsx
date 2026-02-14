import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/ContactForm";
import { Mail, MapPin, Sparkles, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="tournament-shell mx-auto max-w-6xl space-y-12 px-4 py-16">
      <header className="cyberpunk-highlight rounded-2xl border px-6 py-10 md:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Canal de contact
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">Contact</h1>
        <p className="cyberpunk-text-soft mt-4 max-w-3xl text-base md:text-lg">
          Une question, une demande d’inscription ou un partenariat ? Notre équipe vous répond rapidement pour vous
          accompagner.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <Card className="tournament-panel h-full rounded-2xl border border-primary/25">
            <CardHeader>
              <CardTitle className="text-2xl">Coordonnées du club</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 text-gray-700">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm uppercase tracking-wider text-primary">Point de contact principal</p>
                <p className="mt-1 font-medium">Châlons-en-Champagne Tennis de Table</p>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Association sportive CCTT</p>
                  <p className="text-sm text-gray-500">Club FFTT affilié, ouvert à tous les niveaux</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <a
                    href="mailto:communication@cctt.fr"
                    className="text-purple-600 hover:underline"
                  >
                    communication@cctt.fr
                  </a>
                  <p className="text-sm text-gray-500">Réponse habituelle sous 24h à 72h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p>Salle Tirlet</p>
                  <p className="text-sm text-gray-500">Châlons-en-Champagne</p>
                </div>
              </div>

              <p className="cyberpunk-text-soft text-sm max-w-md pt-2">
                Nous nous efforçons de répondre dans les meilleurs délais.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="tournament-panel rounded-2xl border border-primary/25">
            <CardHeader>
              <CardTitle className="text-2xl">Formulaire de contact</CardTitle>
              <p className="cyberpunk-text-soft text-sm">
                Décrivez votre demande avec le plus de détails possibles pour accélérer le traitement.
              </p>
            </CardHeader>

            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
