import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SimpleMember } from "@/lib/comite-content";
import { getComiteResponse } from "@/lib/comite-service";

export const metadata: Metadata = {
  title: "Entraîneurs bénévoles - CCTT",
  description:
    "Découvrez les entraîneurs bénévoles qui accompagnent la pratique et la vie sportive du club CCTT.",
};

const DEFAULT_AVATAR_SRC = "/comite/avatar-default.svg";

function resolvePhoto(photo: string) {
  return photo || DEFAULT_AVATAR_SRC;
}

function BenevoleCard({ member }: { member: SimpleMember }) {
  return (
    <Card className="group mt-10 self-start overflow-visible border-border/45 bg-card/38 shadow-none transition-colors duration-300 hover:bg-card/55 sm:mt-12">
      <CardHeader className="flex flex-col items-center gap-4 p-5 pt-0 text-center">
        <div className="relative -mt-8 h-16 w-16 overflow-hidden rounded-full border border-slate-900/20 bg-background shadow-[0_0_0_3px_rgba(248,250,252,0.86),0_0_0_5px_rgba(15,23,42,0.16)] dark:border-white/25 dark:shadow-[0_0_0_3px_rgba(15,23,42,0.92),0_0_0_5px_rgba(255,255,255,0.16)] sm:-mt-10 sm:h-20 sm:w-20">
          <Image
            src={resolvePhoto(member.photo)}
            alt={member.nom ? `Portrait de ${member.nom}` : "Avatar par défaut"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>

        <div className="space-y-3">
          <Badge
            variant="outline"
            className="gap-2 border-primary/25 bg-primary/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Entraîneur bénévole</span>
          </Badge>
          <CardTitle className="text-xl">{member.nom}</CardTitle>
        </div>
      </CardHeader>

      {member.description ? (
        <CardContent className="px-5 pb-4 pt-0">
          <CardDescription className="mx-auto max-w-[20rem] text-left leading-relaxed">
            {member.description}
          </CardDescription>
        </CardContent>
      ) : null}
    </Card>
  );
}

export default async function EntraineursBenevolesPage() {
  const payload = await getComiteResponse();
  const benevoles = payload.data.benevoles;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 pb-24 pt-12 sm:space-y-14 sm:pb-28">
      <Reveal>
        <header className="rounded-[2rem] border border-border/70 bg-card/72 p-8 shadow-sm backdrop-blur-[8px] sm:p-10">
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
              Encadrement CCTT
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Entraîneurs bénévoles
              </h1>
              <Badge variant="outline">
                {String(benevoles.length).padStart(2, "0")} profil
                {benevoles.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <p className="max-w-3xl text-base leading-relaxed text-foreground/88 sm:text-lg">
              Les entraîneurs bénévoles jouent un rôle essentiel dans la vie du
              club. Ils accompagnent les séances, soutiennent la progression des
              joueurs et participent à la dynamique collective du CCTT.
            </p>
            <div
              className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-muted/30 p-1 sm:w-fit sm:flex-row"
              role="group"
              aria-label="Autres équipes du club"
            >
              <Button asChild className="h-10 rounded-md shadow-none">
                <Link href="/club/comite-directeur">Voir le comité</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-md shadow-none"
              >
                <Link href="/club/salaries">Voir les salariés</Link>
              </Button>
            </div>
          </div>
        </header>
      </Reveal>

      {benevoles.length > 0 ? (
        <section className="space-y-14">
          <Reveal>
            <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
              <h2 className="text-3xl font-semibold">Équipe bénévole</h2>
            </div>
          </Reveal>

          <div className="grid items-start grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 sm:gap-y-20 xl:grid-cols-3">
            {benevoles.map((benevole, index) => (
              <Reveal key={`${benevole.nom}-${index}`} delay={index * 120}>
                <BenevoleCard member={benevole} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <Reveal>
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 bg-card/45 shadow-none">
            <CardHeader>
              <CardTitle>Une présence complémentaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                L&apos;encadrement bénévole complète l&apos;action de l&apos;équipe
                salariée et contribue à maintenir une pratique régulière,
                accessible et conviviale au sein du club.
              </p>
              <p>
                Cette page peut évoluer pour présenter plus en détail les
                bénévoles investis dans les entraînements et la vie sportive du
                CCTT.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-none">
            <CardHeader>
              <CardTitle>Vous souhaitez aider le club ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Si vous souhaitez vous impliquer ponctuellement ou régulièrement
                dans l&apos;encadrement et la vie du club, nous pouvons en parler
                ensemble.
              </p>
              <Button asChild className="h-10 rounded-md shadow-none">
                <Link
                  href="/club/contact"
                  className="inline-flex items-center gap-2"
                >
                  Contacter le club
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </Reveal>
    </div>
  );
}
