/* eslint-disable react/no-unescaped-entities */

import { Mail, MapPin, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  defaultContactContent,
  normalizeContactContent,
} from "@/lib/contact-content";
import { getComiteResponse } from "@/lib/comite-service";
import { prisma } from "@/lib/prisma";
import { canAccessClubSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

export default async function UserClubContactsPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/club/contacts");
  }

  if (!canAccessClubSpace(session.user.role)) {
    redirect("/user?forbidden=club");
  }

  const [existingContact, comite] = await Promise.all([
    prisma.contactContent.findUnique({ where: { id: "default" } }),
    getComiteResponse(),
  ]);

  const contact = normalizeContactContent(existingContact ?? defaultContactContent);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace club
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Contacts utiles</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Un annuaire simple pour retrouver les points de contact du club, le
            noyau dirigeant et les repères déjà visibles dans le site.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Contact principal
            </p>
            <p className="text-lg font-semibold">{contact.email}</p>
            <p className="text-xs text-muted-foreground">
              Adresse de contact centrale du club.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bureau visible
            </p>
            <p className="text-3xl font-semibold">{comite.data.bureau.length}</p>
            <p className="text-xs text-muted-foreground">
              Membres bureau remontes depuis les contenus club.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Salaries visibles
            </p>
            <p className="text-3xl font-semibold">{comite.data.salaries.length}</p>
            <p className="text-xs text-muted-foreground">
              Profils salaries references dans les contenus du comite.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Point de repere
            </p>
            <p className="text-lg font-semibold">{contact.addressName}</p>
            <p className="text-xs text-muted-foreground">
              Lieu de reference pour les echanges et l'accueil.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Contact club
            </CardTitle>
            <CardDescription>
              Les coordonnées centrales déjà configurees sur le site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">{contact.email}</p>
                <p className="text-muted-foreground">{contact.responseDelay}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">{contact.addressName}</p>
                <p className="text-muted-foreground">{contact.addressLine}</p>
                <p className="text-muted-foreground">{contact.addressCity}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/club/contact">Ouvrir la page contact</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Équipe visible
            </CardTitle>
            <CardDescription>
              Les personnes déjà affichees comme repères club dans les contenus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comite.data.bureau.length === 0 &&
            comite.data.salaries.length === 0 &&
            comite.data.membres.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun contact complementaire n'est encore remonte dans les
                contenus du comite.
              </p>
            ) : null}

            {comite.data.bureau.slice(0, 4).map((member) => (
              <div key={`${member.poste}-${member.nom}`} className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <p className="font-medium text-foreground">{member.nom || "Nom a definir"}</p>
                <p className="text-sm text-muted-foreground">{member.poste || "Fonction a definir"}</p>
              </div>
            ))}

            {comite.data.salaries.slice(0, 2).map((member) => (
              <div key={`salarie-${member.nom}`} className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <p className="font-medium text-foreground">{member.nom || "Nom a definir"}</p>
                <p className="text-sm text-muted-foreground">Salarie diplome</p>
              </div>
            ))}

            <Button asChild variant="ghost" className="px-0">
              <Link href="/club/comite-directeur">
                <Users className="mr-2 h-4 w-4" />
                Voir le comite directeur
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
