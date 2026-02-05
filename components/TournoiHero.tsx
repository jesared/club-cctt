import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function TournoiHero() {
  return (
    <>
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Image
            src="/couv-facebook.jpg"
            alt="Tournoi de Pâques 2026 – Châlons-en-Champagne Tennis de Table"
            width={1200}
            height={630}
            className="rounded-lg object-cover"
            priority
          />
        </div>
      </section>
      <section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="bg-purple-50 border-l-4 border-l-purple-500">
            <CardHeader>
              <p className="uppercase tracking-wide text-sm text-purple-600 mb-2">
                Tournoi annuel du club
              </p>

              <CardTitle className="text-4xl md:text-5xl">
                Tournoi de Pâques
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed max-w-4xl">
                Le <strong>Tournoi de Pâques</strong> est le tournoi annuel
                organisé par le Châlons-en-Champagne Tennis de Table. Ouvert aux
                joueurs de tous niveaux, il rassemble chaque année de nombreux
                compétiteurs dans une ambiance conviviale et sportive.
              </p>
              <p className="text-sm text-gray-600">
                Avril 2026 – Châlons-en-Champagne
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/inscriptions"
                  className="inline-flex justify-center bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
                >
                  S’inscrire au tournoi
                </a>

                <a
                  href="/reglement"
                  className="inline-flex justify-center border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-100 transition"
                >
                  Voir le règlement
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
