import ContactForm from "@/components/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Contact</h1>
        <p className="text-gray-600 max-w-3xl">
          Une question, une demande d’inscription ou un partenariat ? N’hésitez
          pas à contacter le Châlons-en-Champagne Tennis de Table.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* COORDONNÉES */}
        <section>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Coordonnées du club</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 text-gray-700">
              {/* CLUB */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Châlons-en-Champagne Tennis de Table
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <a
                    href="mailto:communication@cctt.fr"
                    className="text-purple-600 hover:underline"
                  >
                    communication@cctt.fr
                  </a>
                </div>
              </div>

              {/* LIEU */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p>Salle Tirlet</p>
                  <p className="text-sm text-gray-500">Châlons-en-Champagne</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 max-w-md pt-2">
                Nous nous efforçons de répondre dans les meilleurs délais.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FORMULAIRE */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Formulaire de contact</CardTitle>
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
