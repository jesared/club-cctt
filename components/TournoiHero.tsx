import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

type TournoiHeroProps = {
  imageUrl: string;
  dateLabel: string;
};

export default function TournoiHero({ imageUrl, dateLabel }: TournoiHeroProps) {
  return (
    <>
      <section className="relative">
        <div className="mx-auto">
          <Image
            src={imageUrl}
            alt="Tournoi de Paques – Chalons-en-Champagne Tennis de Table"
            width={1200}
            height={630}
            className="rounded-lg object-cover object-center w-full h-auto animate-fade-soft"
            priority
          />
        </div>
      </section>
      <section>
        <div className="mx-auto py-8">
          <Card className="border-l-4 border-l-primary animate-fade-up">
            <CardHeader>
              <p className="uppercase tracking-wide text-sm text-foreground mb-2 animate-fade-up-1">
                Tournoi annuel du club
              </p>

              <CardTitle className="text-4xl md:text-5xl animate-fade-up-2">
                Tournoi de Paques
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed max-w-4xl">
                Le <strong>Tournoi de Paques</strong> est le tournoi annuel
                organise par le Chalons-en-Champagne Tennis de Table. Ouvert aux
                joueurs de tous niveaux, il rassemble chaque annee de nombreux
                competiteurs dans une ambiance conviviale et sportive.
              </p>
              <p className="text-sm text-muted-foreground">
                {tournamentRegistrationContent.message}
              </p>

              <p className="text-sm text-muted-foreground">{dateLabel}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/tournoi">Infos du tournoi</Link>
                </Button>
                <Button asChild variant="secondary">
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
