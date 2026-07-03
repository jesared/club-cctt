import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { RefreshCw, Search, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CCTT_FFTT_CLUB_NUMBER,
  syncClubMembersFromFftt,
} from "@/lib/club-members";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";

type AdherentsSearchParams = Record<string, string | string[] | undefined>;

const ADMIN_ADHERENTS_PATH = "/admin/adherents";
const PAGE_SIZE_OPTIONS = [10, 20, 100] as const;
const STATUS_FILTERS = ["all", "active", "inactive"] as const;
const GENDER_FILTERS = ["all", "M", "F"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type GenderFilter = (typeof GENDER_FILTERS)[number];

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getPageSize(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : 20;
}

function getStatusFilter(value: string | undefined): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

function getGenderFilter(value: string | undefined): GenderFilter {
  return GENDER_FILTERS.includes(value as GenderFilter)
    ? (value as GenderFilter)
    : "all";
}

function getCleanParam(value: string | undefined) {
  return value?.trim() || "";
}

function getLicenseTypeFilter(value: string | undefined) {
  const cleanValue = getCleanParam(value);

  if (!cleanValue || cleanValue.toLowerCase() === "all") {
    return "all";
  }

  return cleanValue.toUpperCase();
}

function buildAdherentsHref({
  page,
  pageSize,
  query,
  status,
  licenseType,
  gender,
}: {
  page: number;
  pageSize: number;
  query: string;
  status: StatusFilter;
  licenseType: string;
  gender: GenderFilter;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (licenseType !== "all") {
    params.set("type", licenseType);
  }

  if (gender !== "all") {
    params.set("genre", gender);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  if (pageSize !== 20) {
    params.set("perPage", String(pageSize));
  }

  const queryString = params.toString();

  return queryString
    ? `${ADMIN_ADHERENTS_PATH}?${queryString}`
    : ADMIN_ADHERENTS_PATH;
}

function buildSearchWhere(query: string) {
  const terms = query.split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return {};
  }

  return {
    AND: terms.map((term) => ({
      OR: [
        { nom: { contains: term, mode: "insensitive" as const } },
        { prenom: { contains: term, mode: "insensitive" as const } },
        { licence: { contains: term, mode: "insensitive" as const } },
      ],
    })),
  };
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
  const query = getCleanParam(getSingleParam(resolvedSearchParams.q));
  const status = getStatusFilter(getSingleParam(resolvedSearchParams.status));
  const licenseType = getLicenseTypeFilter(
    getSingleParam(resolvedSearchParams.type),
  );
  const gender = getGenderFilter(getSingleParam(resolvedSearchParams.genre));
  const pageSize = getPageSize(getSingleParam(resolvedSearchParams.perPage));
  const requestedPage = getPositiveInt(
    getSingleParam(resolvedSearchParams.page),
    1,
  );
  const memberWhere: Prisma.ClubMemberWhereInput = {
    clubNumber: CCTT_FFTT_CLUB_NUMBER,
    ...(status === "active" ? { active: true } : {}),
    ...(status === "inactive" ? { active: false } : {}),
    ...(licenseType !== "all" ? { licenseType } : {}),
    ...(gender !== "all" ? { gender } : {}),
    ...buildSearchWhere(query),
  };

  const [
    filteredMemberCount,
    totalMemberCount,
    activeCount,
    inactiveCount,
    lastSync,
    licenseTypeRows,
  ] = await Promise.all([
    prisma.clubMember.count({
      where: memberWhere,
    }),
    prisma.clubMember.count({
      where: { clubNumber: CCTT_FFTT_CLUB_NUMBER },
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
    prisma.clubMember.findMany({
      where: {
        clubNumber: CCTT_FFTT_CLUB_NUMBER,
        licenseType: { not: null },
      },
      distinct: ["licenseType"],
      orderBy: { licenseType: "asc" },
      select: { licenseType: true },
    }),
  ]);
  const licenseTypeOptions = licenseTypeRows
    .map((row) => row.licenseType)
    .filter((value): value is string => Boolean(value));
  const totalPages = Math.max(Math.ceil(filteredMemberCount / pageSize), 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart =
    filteredMemberCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filteredMemberCount);
  const members = await prisma.clubMember.findMany({
    where: memberWhere,
    orderBy: [{ active: "desc" }, { nom: "asc" }, { prenom: "asc" }],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const errorMessages: Record<string, string> = {
    "not-configured":
      "API FFTT non configurée. Renseignez FFTT_API_ID, FFTT_API_KEY et FFTT_API_SERIAL.",
    "not-found": "Aucun adhérent n'a été retourné par la FFTT pour ce club.",
    "upstream-error":
      "La FFTT n'a pas pu être jointe pour le moment. Réessayez plus tard.",
  };
  const hasFilters = Boolean(
    query || status !== "all" || licenseType !== "all" || gender !== "all",
  );

  const hrefState = {
    query,
    status,
    licenseType,
    gender,
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
            Synchro terminée : {total ?? "0"} adhérent(s), {created ?? "0"}{" "}
            créé(s), {updated ?? "0"} mis à jour, {inactive ?? "0"} passé(s)
            inactif(s).
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-destructive/30 bg-destructive/6">
          <CardContent className="p-4 text-sm text-destructive">
            {errorMessages[error] ?? "La synchronisation FFTT a échoué."}
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
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle>Licenciés FFTT</CardTitle>
              <CardDescription>
                {filteredMemberCount > 0 ? (
                  <>
                    Lignes {pageStart} à {pageEnd} sur {filteredMemberCount}
                    {hasFilters ? ` résultat(s), ${totalMemberCount} au total.` : "."}
                  </>
                ) : hasFilters ? (
                  "Aucun licencié ne correspond aux filtres."
                ) : (
                  "Aucun licencié synchronisé pour le moment."
                )}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Par page</span>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <Button
                  asChild
                  key={option}
                  size="sm"
                  variant={option === pageSize ? "default" : "outline"}
                >
                  <Link
                    href={buildAdherentsHref({
                      page: 1,
                      pageSize: option,
                      ...hrefState,
                    })}
                  >
                    {option}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={ADMIN_ADHERENTS_PATH}
            className="grid gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-[minmax(220px,1fr)_160px_150px_150px_auto_auto]"
          >
            {pageSize !== 20 ? (
              <input type="hidden" name="perPage" value={pageSize} />
            ) : null}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                defaultValue={query}
                name="q"
                placeholder="Nom, prénom ou licence"
                type="search"
              />
            </div>
            <select
              aria-label="Filtrer par statut"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              defaultValue={status}
              name="status"
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <select
              aria-label="Filtrer par type de licence"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              defaultValue={licenseType}
              name="type"
            >
              <option value="all">Tous types</option>
              {licenseTypeOptions.map((option) => (
                <option key={option} value={option}>
                  Type {option}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrer par genre"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              defaultValue={gender}
              name="genre"
            >
              <option value="all">Tous genres</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
            {hasFilters ? (
              <Button asChild type="button" variant="outline" className="gap-2">
                <Link
                  href={buildAdherentsHref({
                    page: 1,
                    pageSize,
                    query: "",
                    status: "all",
                    licenseType: "all",
                    gender: "all",
                  })}
                >
                  <X className="h-4 w-4" />
                  Effacer
                </Link>
              </Button>
            ) : null}
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Nom</th>
                  <th className="py-2 pr-3 font-medium">Licence</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
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
                      {member.licenseType ?? "-"}
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
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      {hasFilters
                        ? "Aucun adhérent ne correspond aux filtres."
                        : "Aucun adhérent synchronisé pour le moment."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
            <p className="text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                asChild={currentPage > 1}
                disabled={currentPage <= 1}
                size="sm"
                variant="outline"
              >
                {currentPage > 1 ? (
                  <Link
                    href={buildAdherentsHref({
                      page: currentPage - 1,
                      pageSize,
                      ...hrefState,
                    })}
                  >
                    Précédent
                  </Link>
                ) : (
                  <span>Précédent</span>
                )}
              </Button>
              <Button
                asChild={currentPage < totalPages}
                disabled={currentPage >= totalPages}
                size="sm"
                variant="outline"
              >
                {currentPage < totalPages ? (
                  <Link
                    href={buildAdherentsHref({
                      page: currentPage + 1,
                      pageSize,
                      ...hrefState,
                    })}
                  >
                    Suivant
                  </Link>
                ) : (
                  <span>Suivant</span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
