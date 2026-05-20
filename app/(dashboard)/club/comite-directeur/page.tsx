import Image from "next/image";
import { Users } from "lucide-react";

import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimpleMember } from "@/lib/comite-content";
import { getComiteResponse } from "@/lib/comite-service";

const DEFAULT_AVATAR_SRC = "/avatar-neutral.svg";

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
    <Card className="card-hover">
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-xl border bg-muted/30">
          <Image
            src={resolvePhoto(photo)}
            alt={name ? `Portrait de ${name}` : "Avatar par defaut"}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <p className="font-medium">{name}</p>
        </div>
      </CardHeader>

      {description ? (
        <CardContent className="pt-0 text-center text-sm text-gray-500">
          {description}
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
    <Card className="card-hover">
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted/30">
          <Image
            src={resolvePhoto(member.photo)}
            alt={member.nom ? `Portrait de ${member.nom}` : "Avatar par defaut"}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
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
        <header className="rounded-xl border bg-card/70 p-8 shadow-sm">
          <p className="mb-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] animate-fade-up-1">
            Gouvernance CCTT
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mb-4 text-4xl font-bold animate-fade-up-2">
              Comite directeur
            </h1>
            {formattedUpdatedAt ? (
              <Badge variant={meta.stale ? "secondary" : "outline"}>
                {meta.stale
                  ? `Derniere mise a jour le ${formattedUpdatedAt}`
                  : `Mis a jour le ${formattedUpdatedAt}`}
              </Badge>
            ) : meta.stale ? (
              <Badge variant="secondary">
                Derniere mise a jour indisponible
              </Badge>
            ) : (
              <Badge variant="outline">Mise a jour en cours</Badge>
            )}
          </div>
          <p className="max-w-3xl">
            Le comite directeur du Chalons-en-Champagne Tennis de Table assure
            la gestion, l&apos;organisation et le developpement du club.
          </p>
        </header>
      </Reveal>

      <section>
        <Reveal>
          <h2 className="mb-8 text-3xl font-semibold">Bureau</h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

      <section>
        <Reveal>
          <h2 className="mb-8 text-3xl font-semibold">Membres du comite</h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.membres.map((membre, index) => (
            <Reveal key={`${membre.nom}-${index}`} delay={index * 120}>
              <SimplePersonCard roleLabel="Membre" member={membre} />
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <h2 className="mb-8 text-3xl font-semibold">Salaries diplomes</h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.salaries.map((salarie, index) => (
            <Reveal key={`${salarie.nom}-${index}`} delay={index * 120}>
              <SimplePersonCard roleLabel="Salarie diplome" member={salarie} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
