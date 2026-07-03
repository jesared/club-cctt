import { CalendarDays, Filter, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchFfttClubTeamResults,
  type FfttClubTeamResults,
  type FfttTeamMatch,
} from "@/lib/fftt";

export const metadata: Metadata = {
  title: "Compétitions | Châlons-en-Champagne Tennis de Table",
  description:
    "Résultats des équipes du Châlons-en-Champagne Tennis de Table en championnat FFTT.",
};

export const revalidate = 1800;

const CLUB_NUMBER = process.env.FFTT_CLUB_NUMBER?.trim() || "06510112";

type CompetitionsSearchParams = Promise<{
  division?: string | string[];
  [key: string]: string | string[] | undefined;
}>;

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getTeamDivision(team: FfttClubTeamResults) {
  return team.divisionName || "Division non précisée";
}

function getMatchRound(match: FfttTeamMatch) {
  return Number.parseInt(
    match.label.match(/\btour\s*n?[°º]?\s*(\d+)/i)?.[1] ?? "",
    10,
  );
}

function sortMatchesByNewestRound(matches: FfttTeamMatch[]) {
  return [...matches].sort((a, b) => {
    const roundA = getMatchRound(a);
    const roundB = getMatchRound(b);

    if (!Number.isNaN(roundA) && !Number.isNaN(roundB) && roundA !== roundB) {
      return roundB - roundA;
    }

    return getMatchDate(b).localeCompare(getMatchDate(a), "fr", {
      numeric: true,
    });
  });
}

function getMatchOutcomeLabel(match: FfttTeamMatch) {
  if (match.isWin === true) {
    return "Victoire";
  }

  if (match.isWin === false) {
    return "Défaite";
  }

  return "À venir";
}

function getOpponent(match: FfttTeamMatch) {
  if (match.isHome === true) {
    return match.teamB;
  }

  if (match.isHome === false) {
    return match.teamA;
  }

  return `${match.teamA} / ${match.teamB}`;
}

function getClubScore(match: FfttTeamMatch) {
  if (!match.scoreA || !match.scoreB) {
    return "-";
  }

  if (match.isHome === true) {
    return `${match.scoreA} - ${match.scoreB}`;
  }

  if (match.isHome === false) {
    return `${match.scoreB} - ${match.scoreA}`;
  }

  return `${match.scoreA} - ${match.scoreB}`;
}

function getMatchDate(match: FfttTeamMatch) {
  return match.playedDate || match.plannedDate || "-";
}

function hasMatchScore(match: FfttTeamMatch) {
  return Boolean(match.scoreA && match.scoreB);
}

function getMatchStatusLabel(match: FfttTeamMatch) {
  if (!hasMatchScore(match)) {
    return "À venir";
  }

  return getMatchOutcomeLabel(match);
}

function getMatchStatusVariant(match: FfttTeamMatch) {
  if (!hasMatchScore(match)) {
    return "outline";
  }

  return match.isWin === true ? "default" : "secondary";
}

function sortMatchesByOldestDate(matches: FfttTeamMatch[]) {
  return [...matches].sort((a, b) =>
    getMatchDate(a).localeCompare(getMatchDate(b), "fr", { numeric: true }),
  );
}

function getTeamRecord(matches: FfttTeamMatch[]) {
  return matches.reduce(
    (record, match) => {
      if (!hasMatchScore(match)) {
        record.pending += 1;
      } else if (match.isWin === true) {
        record.wins += 1;
      } else {
        record.losses += 1;
      }

      return record;
    },
    { wins: 0, losses: 0, pending: 0 },
  );
}

function getLatestPlayedMatch(matches: FfttTeamMatch[]) {
  return sortMatchesByNewestRound(matches).find(hasMatchScore) ?? null;
}

function getNextMatch(matches: FfttTeamMatch[]) {
  return sortMatchesByOldestDate(matches).find((match) => !hasMatchScore(match)) ?? null;
}

function groupTeamsByDivision(teams: FfttClubTeamResults[]) {
  const groups = new Map<string, FfttClubTeamResults[]>();

  for (const team of teams) {
    const division = getTeamDivision(team);
    groups.set(division, [...(groups.get(division) ?? []), team]);
  }

  return Array.from(groups.entries())
    .map(([division, divisionTeams]) => ({
      division,
      teams: divisionTeams.sort((a, b) =>
        a.teamName.localeCompare(b.teamName, "fr", { numeric: true }),
      ),
    }))
    .sort((a, b) =>
      a.division.localeCompare(b.division, "fr", { numeric: true }),
    );
}

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: CompetitionsSearchParams;
}) {
  const params = await searchParams;
  const selectedDivision = getSearchValue(params.division);
  const results = await fetchFfttClubTeamResults(CLUB_NUMBER);

  const allTeams = results.ok ? results.teams : [];
  const divisionOptions = Array.from(
    new Set(allTeams.map(getTeamDivision)),
  ).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
  const filteredTeams = allTeams
    .filter(
      (team) => !selectedDivision || getTeamDivision(team) === selectedDivision,
    )
    .map((team) => ({
      ...team,
      matches: sortMatchesByNewestRound(team.matches),
    }));
  const displayedMatches = filteredTeams.reduce(
    (total, team) => total + team.matches.length,
    0,
  );
  const divisionGroups = groupTeamsByDivision(filteredTeams);
  const hasActiveFilters = Boolean(selectedDivision);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <Reveal>
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Championnats FFTT
          </div>
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Résultats des équipes
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Les rencontres officielles du club sont synchronisées depuis la
              FFTT. Les scores affichés concernent les équipes du
              Châlons-en-Champagne Tennis de Table.
            </p>
          </div>
        </header>
      </Reveal>

      {!results.ok ? (
        <Reveal delay={80}>
          <Alert>
            <AlertTitle>Résultats indisponibles</AlertTitle>
            <AlertDescription>{results.message}</AlertDescription>
          </Alert>
        </Reveal>
      ) : (
        <>
          <Reveal delay={80}>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-semibold">
                  {filteredTeams.length}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  équipes affichées
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-semibold">
                  {displayedMatches}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  rencontres affichées
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-2xl font-semibold">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  30 min
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  fréquence de mise à jour
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={100}>
            <form
              action="/competitions"
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid flex-1 gap-4 sm:max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <select
                      id="division"
                      name="division"
                      defaultValue={selectedDivision}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="">Toutes les divisions</option>
                      {divisionOptions.map((division) => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hasActiveFilters ? (
                    <Button asChild variant="outline">
                      <Link href="/competitions">Réinitialiser</Link>
                    </Button>
                  ) : null}
                  <Button type="submit">
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    Filtrer
                  </Button>
                </div>
              </div>
            </form>
          </Reveal>

          {filteredTeams.length === 0 ? (
            <Reveal delay={120}>
              <Alert>
                <AlertTitle>Aucun résultat pour ces filtres</AlertTitle>
                <AlertDescription>
                  Modifiez la division pour afficher les rencontres
                  disponibles.
                </AlertDescription>
              </Alert>
            </Reveal>
          ) : null}

          <section className="space-y-8">
            {divisionGroups.map((group, groupIndex) => (
              <Reveal key={group.division} delay={120 + groupIndex * 40}>
                <section className="space-y-4">
                  <div className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {group.division}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {group.teams.length} équipe
                        {group.teams.length > 1 ? "s" : ""} ·{" "}
                        {group.teams.reduce(
                          (total, team) => total + team.matches.length,
                          0,
                        )}{" "}
                        rencontres
                      </p>
                    </div>
                    <Badge variant="outline">{group.division}</Badge>
                  </div>

                  <div className="space-y-5">
                    {group.teams.map((team) => {
                      const latestMatch = getLatestPlayedMatch(team.matches);
                      const nextMatch = getNextMatch(team.matches);
                      const record = getTeamRecord(team.matches);

                      return (
                        <Card key={team.divisionLink} className="overflow-hidden">
                          <CardHeader>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-2">
                                <CardTitle className="text-xl">
                                  {team.teamName}
                                </CardTitle>
                                <CardDescription>
                                  {team.eventName || "Championnat FFTT"}
                                </CardDescription>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                  {record.wins} V · {record.losses} D
                                </Badge>
                                {record.pending > 0 ? (
                                  <Badge variant="secondary">
                                    {record.pending} à venir
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">
                                  Dernier résultat
                                </div>
                                {latestMatch ? (
                                  <div className="mt-2 space-y-1">
                                    <div className="font-semibold">
                                      {getClubScore(latestMatch)} ·{" "}
                                      {getMatchStatusLabel(latestMatch)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {getMatchDate(latestMatch)} contre{" "}
                                      {getOpponent(latestMatch)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Aucun score enregistré pour le moment.
                                  </div>
                                )}
                              </div>

                              <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">
                                  Prochaine rencontre
                                </div>
                                {nextMatch ? (
                                  <div className="mt-2 space-y-1">
                                    <div className="font-semibold">
                                      {getMatchDate(nextMatch)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {nextMatch.isHome === true
                                        ? "À domicile"
                                        : nextMatch.isHome === false
                                          ? "À l'extérieur"
                                          : "Lieu à confirmer"}{" "}
                                      contre {getOpponent(nextMatch)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Toutes les rencontres affichées sont jouées.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3 md:hidden">
                              {team.matches.map((match) => (
                                <div
                                  key={`${match.meetingId}-${match.teamA}-${match.teamB}-${match.plannedDate}`}
                                  className="rounded-lg border p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="text-sm font-semibold">
                                        {match.label}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {getMatchDate(match)} ·{" "}
                                        {match.isHome === true
                                          ? "Domicile"
                                          : match.isHome === false
                                            ? "Extérieur"
                                            : "Lieu à confirmer"}
                                      </div>
                                    </div>
                                    <Badge variant={getMatchStatusVariant(match)}>
                                      {getMatchStatusLabel(match)}
                                    </Badge>
                                  </div>
                                  <div className="mt-3 flex items-end justify-between gap-4">
                                    <div className="text-sm">
                                      {getOpponent(match)}
                                    </div>
                                    <div className="text-lg font-semibold">
                                      {getClubScore(match)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="hidden md:block">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Tour</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Adversaire</TableHead>
                                    <TableHead>Lieu</TableHead>
                                    <TableHead className="text-right">
                                      Score
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Résultat
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {team.matches.map((match) => (
                                    <TableRow
                                      key={`${match.meetingId}-${match.teamA}-${match.teamB}-${match.plannedDate}`}
                                    >
                                      <TableCell className="min-w-44 font-medium">
                                        {match.label}
                                      </TableCell>
                                      <TableCell>
                                        {getMatchDate(match)}
                                      </TableCell>
                                      <TableCell>{getOpponent(match)}</TableCell>
                                      <TableCell>
                                        {match.isHome === true
                                          ? "Domicile"
                                          : match.isHome === false
                                            ? "Extérieur"
                                            : "-"}
                                      </TableCell>
                                      <TableCell className="text-right font-semibold">
                                        {getClubScore(match)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Badge
                                          variant={getMatchStatusVariant(match)}
                                        >
                                          {getMatchStatusLabel(match)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              </Reveal>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
