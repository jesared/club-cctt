import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function TournoiHero() {
  return (
    <>
      <section className="relative">
        <div className="mx-auto">
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
        <div className="mx-auto py-8">
          <Card className="border-l-4 border-l-primary  ">
            <CardHeader>
              <p className="uppercase tracking-wide text-sm text-foreground mb-2 ">
                Tournoi annuel du club
              </p>

              <CardTitle className="text-4xl md:text-5xl">
                Tournoi de Pâques
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed max-w-4xl -text-soft">
                Le <strong>Tournoi de Pâques</strong> est le tournoi annuel
                organisé par le Châlons-en-Champagne Tennis de Table. Ouvert aux
                joueurs de tous niveaux, il rassemble chaque année de nombreux
                compétiteurs dans une ambiance conviviale et sportive.
              </p>
              <p className="text-sm text-muted-foreground ">
                {tournamentRegistrationContent.message}
              </p>

              <p className="text-sm text-muted-foreground ">
                Avril 2026 – Châlons-en-Champagne
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/tournoi">Infos du tournoi</Link>
                </Button>
                <Button asChild variant={"secondary"}>
                  <Link href={tournamentRegistrationContent.cta.href}>
                    {tournamentRegistrationContent.cta.label}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
