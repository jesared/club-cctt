import { BellRing, Megaphone, Pin, TriangleAlert } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { canAccessClubSpace } from "@/lib/roles";
import { getCurrentSession } from "@/lib/session";

function formatMessageDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function UserClubAnnoncesPage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/user/club/annonces");
  }

  if (!canAccessClubSpace(session.user.role)) {
    redirect("/user?forbidden=club");
  }

  const messages = await prisma.message.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [{ important: "desc" }, { createdAt: "desc" }],
    take: 12,
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const importantCount = messages.filter((message) => message.important).length;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Espace club
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Annonces internes</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cette page regroupe les annonces publiees dans l'outil de messages
            pour en faire un point d'entree plus simple pour les personnes qui
            participent a la vie du club.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Annonces visibles
            </p>
            <p className="text-3xl font-semibold">{messages.length}</p>
            <p className="text-xs text-muted-foreground">
              Messages publies remontes dans l'espace club.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prioritaires
            </p>
            <p className="text-3xl font-semibold">{importantCount}</p>
            <p className="text-xs text-muted-foreground">
              Annonces marquees importantes par l'administration.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Usage conseille
            </p>
            <p className="text-lg font-semibold">Brief interne</p>
            <p className="text-xs text-muted-foreground">
              A utiliser comme mur d'infos avant relai vers les adherents.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Prochaine evolution
            </p>
            <p className="text-lg font-semibold">Ciblage</p>
            <p className="text-xs text-muted-foreground">
              Plus tard, on pourra segmenter les annonces par role ou par espace.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Fil des annonces</h2>
          <p className="text-sm text-muted-foreground">
            Les messages ci-dessous proviennent des publications deja gerees
            dans l'administration.
          </p>
        </div>

        {messages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="font-medium text-foreground">
                Aucune annonce publiee pour le moment.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Les prochaines communications internes apparaitront ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={
                  message.important ? "border-primary/40 bg-primary/5" : undefined
                }
              >
                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{message.title}</CardTitle>
                        {message.important ? (
                          <Badge>
                            <Pin className="mr-1 h-3 w-3" />
                            Important
                          </Badge>
                        ) : null}
                      </div>
                      <CardDescription>
                        {message.author.name || message.author.email || "Club"} |{" "}
                        {formatMessageDate(message.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="rounded-full border border-border/80 bg-muted/30 p-2 text-muted-foreground">
                      {message.important ? (
                        <TriangleAlert className="h-4 w-4 text-primary" />
                      ) : (
                        <Megaphone className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              Bon usage
            </CardTitle>
            <CardDescription>
              Quelques regles simples pour faire de cet espace un vrai canal
              utile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Publier ici ce qui est utile au fonctionnement interne du club.</p>
            <p>Garder les messages importants courts, actionnables et dates.</p>
            <p>Utiliser les documents du club pour les supports persistants.</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/80 bg-card/80 shadow-none">
          <CardHeader>
            <CardTitle>Suite logique</CardTitle>
            <CardDescription>
              La prochaine version pourra distinguer annonces club, bureau et
              entraineur au lieu d'un flux commun.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
