import ContactForm from "@/components/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Sparkles, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-4">
      <header className="rounded-xl border  p-8 shadow-sm ">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] ">
          <Sparkles className="h-3.5 w-3.5" />
          Canal de contact
        </p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">Contact</h1>
        <p className="cyberpunk-text-soft mt-4 max-w-3xl text-base md:text-lg">
          Une question, une demande d’inscription ou un partenariat ? Notre
          équipe vous répond rapidement pour vous accompagner.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <Card className="bg-accent h-full border ">
            <CardHeader>
              <CardTitle className="text-2xl">Coordonnées du club</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 ">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm uppercase tracking-wider text-foreground/70 ">
                  Point de contact principal
                </p>
                <p className="mt-1 font-medium">
                  Châlons-en-Champagne Tennis de Table
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 mt-0.5 text-foreground/70" />
                <div>
                  <p className="font-medium  ">Association sportive CCTT</p>
                  <p className="text-sm ">
                    Club FFTT affilié, ouvert à tous les niveaux
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-foreground/70 mt-0.5" />
                <div>
                  <a
                    href="mailto:communication@cctt.fr"
                    className="text-accent hover:underline"
                  >
                    communication@cctt.fr
                  </a>
                  <p className="text-sm ">Réponse habituelle sous 24h à 72h</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-foreground/70 mt-0.5" />
                <div>
                  <p>Salle Tirlet</p>
                  <p className="text-sm ">Châlons-en-Champagne</p>
                </div>
              </div>

              <p className=" text-sm max-w-md pt-2">
                Nous nous efforçons de répondre dans les meilleurs délais.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="tournament-panel border border-primary/25">
            <CardHeader>
              <CardTitle className="text-2xl">Formulaire de contact</CardTitle>
              <p className=" text-sm">
                Décrivez votre demande avec le plus de détails possibles pour
                accélérer le traitement.
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
