import Image from "next/image";
import { Users } from "lucide-react";

import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimpleMember } from "@/lib/comite-content";
import { getComiteResponse } from "@/lib/comite-service";

const DEFAULT_AVATAR_SRC = "/comite/avatar-default.svg";

function resolvePhoto(photo: string) {
  return photo || DEFAULT_AVATAR_SRC;
}

function PersonCard({
  title,
  name,
  photo,
  description,
}: {
  title: string;
  name: string;
  photo: string;
  description?: string;
}) {
  return (
    <Card className="group overflow-visible border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-col items-center gap-5 pb-4 text-center">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border border-white/25 bg-muted/15 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.6)] ring-4 ring-background/85">
          <Image
            src={resolvePhoto(photo)}
            alt={name ? `Portrait de ${name}` : "Avatar par défaut"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>

        <div className="space-y-2">
          <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {title}
          </p>
          <CardTitle className="text-2xl leading-tight">{name}</CardTitle>
        </div>
      </CardHeader>

      {description ? (
        <CardContent className="pt-0 text-center text-sm text-muted-foreground">
          <div className="mx-auto mb-4 h-px w-14 bg-border/70" />
          <p className="leading-relaxed">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

function SimplePersonCard({
  roleLabel,
  member,
}: {
  roleLabel: string;
  member: SimpleMember;
}) {
  return (
    <Card className="group overflow-visible border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/25 bg-muted/15 ring-4 ring-background/85">
          <Image
            src={resolvePhoto(member.photo)}
            alt={member.nom ? `Portrait de ${member.nom}` : "Avatar par défaut"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Users className="h-4 w-4" />
            <span>{roleLabel}</span>
          </div>
          <CardTitle className="text-xl">{member.nom}</CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}

export default async function ComiteDirecteurPage() {
  const payload = await getComiteResponse();
  const { data, meta } = payload;
  const formattedUpdatedAt = meta.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.updatedAt))
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-12">
      <Reveal>
        <header className="rounded-[2rem] border border-border/70 bg-card/72 p-8 shadow-sm backdrop-blur-[8px] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-end">
            <div>
              <p className="mb-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] animate-fade-up-1">
                Gouvernance CCTT
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="mb-4 text-4xl font-bold tracking-tight animate-fade-up-2 sm:text-5xl">
                  Comité directeur
                </h1>
                {formattedUpdatedAt ? (
                  <Badge variant={meta.stale ? "secondary" : "outline"}>
                    {meta.stale
                      ? `Dernière mise à jour le ${formattedUpdatedAt}`
                      : `Mis à jour le ${formattedUpdatedAt}`}
                  </Badge>
                ) : meta.stale ? (
                  <Badge variant="secondary">
                    Dernière mise à jour indisponible
                  </Badge>
                ) : (
                  <Badge variant="outline">Mise à jour en cours</Badge>
                )}
              </div>
              <p className="max-w-3xl text-base leading-relaxed text-foreground/88 sm:text-lg">
                Le comité directeur du Châlons-en-Champagne Tennis de Table assure
                la gestion, l&apos;organisation et le développement du club.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-border/70 bg-background/52 p-4 backdrop-blur-[6px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Bureau
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {String(data.bureau.length).padStart(2, "0")}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/70 bg-background/52 p-4 backdrop-blur-[6px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Membres
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {String(data.membres.length).padStart(2, "0")}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/70 bg-background/52 p-4 backdrop-blur-[6px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Salariés
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {String(data.salaries.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <section className="space-y-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <h2 className="text-3xl font-semibold">Bureau</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {data.bureau.map((personne, index) => (
            <Reveal key={`${personne.poste}-${personne.nom}`} delay={index * 120}>
              <PersonCard
                title={personne.poste}
                name={personne.nom}
                photo={personne.photo}
                description={personne.description}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <h2 className="text-3xl font-semibold">Membres du comité</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {data.membres.map((membre, index) => (
            <Reveal key={`${membre.nom}-${index}`} delay={index * 120}>
              <SimplePersonCard roleLabel="Membre" member={membre} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <h2 className="text-3xl font-semibold">Salariés diplômés</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {data.salaries.map((salarie, index) => (
            <Reveal key={`${salarie.nom}-${index}`} delay={index * 120}>
              <SimplePersonCard roleLabel="Salarié diplômé" member={salarie} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
