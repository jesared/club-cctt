import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RefreshCw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CCTT_FFTT_CLUB_NUMBER,
  syncClubMembersFromFftt,
} from "@/lib/club-members";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";

type AdherentsSearchParams = Record<string, string | string[] | undefined>;
const ADMIN_ADHERENTS_PATH = "/admin/adherents";

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "Jamais";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

async function syncAdherents() {
  "use server";

  await requireAdminSession();

  const result = await syncClubMembersFromFftt(CCTT_FFTT_CLUB_NUMBER);

  if (!result.ok) {
    redirect(`${ADMIN_ADHERENTS_PATH}?error=${result.reason}`);
  }

  revalidatePath(ADMIN_ADHERENTS_PATH);
  redirect(
    `${ADMIN_ADHERENTS_PATH}?notice=synced&total=${result.total}&created=${result.created}&updated=${result.updated}&inactive=${result.inactive}`,
  );
}

export default async function AdminAdherentsPage({
  searchParams,
}: {
  searchParams?: Promise<AdherentsSearchParams>;
}) {
  await requireAdminSession();

  const resolvedSearchParams = (await searchParams) ?? {};
  const notice = getSingleParam(resolvedSearchParams.notice);
  const error = getSingleParam(resolvedSearchParams.error);
  const total = getSingleParam(resolvedSearchParams.total);
  const created = getSingleParam(resolvedSearchParams.created);
  const updated = getSingleParam(resolvedSearchParams.updated);
  const inactive = getSingleParam(resolvedSearchParams.inactive);

  const [members, activeCount, inactiveCount, lastSync] = await Promise.all([
    prisma.clubMember.findMany({
      where: { clubNumber: CCTT_FFTT_CLUB_NUMBER },
      orderBy: [{ active: "desc" }, { nom: "asc" }, { prenom: "asc" }],
      take: 250,
    }),
    prisma.clubMember.count({
      where: { clubNumber: CCTT_FFTT_CLUB_NUMBER, active: true },
    }),
    prisma.clubMember.count({
      where: { clubNumber: CCTT_FFTT_CLUB_NUMBER, active: false },
    }),
    prisma.clubMember.findFirst({
      where: { clubNumber: CCTT_FFTT_CLUB_NUMBER },
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    }),
  ]);

  const errorMessages: Record<string, string> = {
    "not-configured":
      "API FFTT non configurée. Renseignez FFTT_API_ID, FFTT_API_KEY et FFTT_API_SERIAL.",
    "not-found": "Aucun adhérent n'a été retourné par la FFTT pour ce club.",
    "upstream-error":
      "La FFTT n'a pas pu être jointe pour le moment. Réessayez plus tard.",
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                FFTT club {CCTT_FFTT_CLUB_NUMBER}
              </p>
              <CardTitle className="text-3xl">Adhérents du club</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                Liste synchronisée depuis l&apos;API FFTT, séparée des joueurs du
                tournoi pour conserver une base club propre.
              </CardDescription>
            </div>
            <form action={syncAdherents}>
              <Button type="submit" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Synchroniser FFTT
              </Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      {notice === "synced" ? (
        <Card className="border-emerald-500/30 bg-emerald-500/8">
          <CardContent className="p-4 text-sm text-emerald-700">
            Synchro terminée : {total ?? "0"} adhérent(s), {created ?? "0"} créé(s),{" "}
            {updated ?? "0"} mis à jour, {inactive ?? "0"} passé(s) inactif(s).
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-destructive/30 bg-destructive/6">
          <CardContent className="p-4 text-sm text-destructive">
            {errorMessages[error] ?? "La synchronisation FFTT a echoue."}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 bg-card shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Actifs
            </p>
            <p className="text-3xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Inactifs
            </p>
            <p className="text-3xl font-semibold">{inactiveCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card shadow-sm sm:col-span-2">
          <CardContent className="flex h-full items-center gap-3 p-5">
            <span className="rounded-full bg-primary/10 p-3 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Dernière synchronisation</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(lastSync?.syncedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Licenciés FFTT</CardTitle>
          <CardDescription>
            Affichage limité aux 250 premières lignes pour garder la page rapide.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Nom</th>
                <th className="py-2 pr-3 font-medium">Licence</th>
                <th className="py-2 pr-3 font-medium">Points</th>
                <th className="py-2 pr-3 font-medium">Genre</th>
                <th className="py-2 pr-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="py-3 pr-3 text-foreground">
                    {member.prenom} {member.nom}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {member.licence}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {member.points ?? "-"}
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {member.gender ?? "-"}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={
                        member.active
                          ? "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600"
                          : "rounded-full border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
                      }
                    >
                      {member.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))}
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Aucun adhérent synchronisé pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
