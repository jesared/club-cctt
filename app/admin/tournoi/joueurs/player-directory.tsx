"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, CreditCard, Pencil, Search, UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminPlayerRow } from "../data";
import { getPlayerSearchTerms, scorePlayerSearch } from "../player-search";

export type DirectoryPlayer = Pick<
  AdminPlayerRow,
  "id" | "name" | "club" | "licence" | "ranking" | "dossard" |
  "table" | "status" | "statusDetail" | "payment" | "fullyRefunded" | "paymentGroupKey"
>;

const collator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });
const numberFormatter = new Intl.NumberFormat("fr-FR");
const sortLabels = {
  name: "Nom (A à Z)",
  points: "Points (décroissants)",
  bib: "Dossard (croissant)",
} as const;

function PlayerInitials({ name, className }: { name: string; className?: string }) {
  const words = name.trim().split(/\s+/);
  const initials = words.length > 1
    ? words[0][0] + words[words.length - 1][0]
    : words[0].slice(0, 2);

  return (
    <span aria-hidden="true" className={cn(
      "grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary",
      className,
    )}>
      {initials || <UserRound className="size-4" />}
    </span>
  );
}

export function PlayerDirectory({ players }: { players: DirectoryPlayer[] }) {
  const [query, setQuery] = useState("");
  const [club, setClub] = useState("");
  const [sort, setSort] = useState<keyof typeof sortLabels>("name");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const profileHeading = useRef<HTMLHeadingElement>(null);
  const playerList = useRef<HTMLUListElement>(null);

  const clubs = useMemo(() => (
    [...new Set(players.map((player) => player.club).filter((name) => name && name !== "—"))]
      .sort(collator.compare)
  ), [players]);

  const results = useMemo(() => {
    const terms = getPlayerSearchTerms(query);
    const matches = players.filter((player) => {
      if (club && player.club !== club) return false;
      if (!terms.length || (terms.length === 1 && terms[0] === String(player.dossard))) return true;
      return scorePlayerSearch(terms, player) !== null;
    });

    if (sort === "points") {
      matches.sort((a, b) => (Number(b.ranking) || 0) - (Number(a.ranking) || 0));
    }
    if (sort === "bib") matches.sort((a, b) => a.dossard - b.dossard);
    return matches;
  }, [players, query, club, sort]);

  const selectedPlayer = results.find((player) => player.id === selectedId) ?? results[0];
  const mobileProfileOpen = showMobileProfile && !!selectedPlayer;

  useEffect(() => {
    const heading = profileHeading.current;
    if (mobileProfileOpen && heading && window.matchMedia("(max-width: 767px)").matches) {
      heading.focus();
    }
  }, [mobileProfileOpen, selectedPlayer?.id]);

  function returnToDirectory() {
    setShowMobileProfile(false);
    requestAnimationFrame(() => playerList.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus());
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.45fr)] lg:gap-6">
      <section aria-labelledby="player-directory-heading" className={cn(
        "min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm",
        mobileProfileOpen && "hidden md:block",
      )}>
        <div className="space-y-3 border-b p-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <h2 id="player-directory-heading" className="font-semibold">Annuaire</h2>
            <span role="status" className="text-xs tabular-nums text-muted-foreground">
              {numberFormatter.format(results.length)} {results.length === 1 ? "joueur" : "joueurs"}
            </span>
          </div>
          <label className="relative block">
            <span className="sr-only">Rechercher par nom, club, licence ou dossard</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, club, licence, dossard…"
              maxLength={120}
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="min-w-0 space-y-1.5 text-xs font-medium text-muted-foreground">
              <span>Club</span>
              <select
                value={club}
                onChange={(event) => setClub(event.target.value)}
                className="h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
              >
                <option value="">Tous les clubs</option>
                {clubs.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label className="min-w-0 space-y-1.5 text-xs font-medium text-muted-foreground">
              <span>Trier par</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as keyof typeof sortLabels)}
                className="h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
              >
                {Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
        </div>
        {results.length > 0 ? (
          <ul ref={playerList} className="divide-y md:max-h-[min(58vh,36rem)] md:overflow-y-auto">
            {results.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  aria-controls="player-profile"
                  aria-pressed={selectedPlayer?.id === player.id}
                  className="flex w-full cursor-pointer items-center gap-3 border-l-[3px] border-transparent px-3 py-3 text-left hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:aria-pressed:border-primary md:aria-pressed:bg-primary/5"
                  onClick={() => {
                    setSelectedId(player.id);
                    setShowMobileProfile(true);
                  }}
                >
                  <PlayerInitials name={player.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold">{player.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{player.club === "—" ? "Club non renseigné" : player.club}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">#{player.dossard}</span>
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-3 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {players.length ? "Aucun joueur ne correspond à la recherche." : "Aucun joueur inscrit pour ce tournoi."}
            </p>
            {players.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={() => { setQuery(""); setClub(""); }}>
                Effacer les filtres
              </Button>
            )}
          </div>
        )}
      </section>

      {selectedPlayer ? (
        <section id="player-profile" aria-labelledby="player-profile-heading" className={cn(
          "min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm",
          !mobileProfileOpen && "hidden md:block",
        )}>
          <div className="border-b bg-primary/5 p-5 sm:p-6">
            <Button type="button" variant="ghost" size="sm" className="-ml-2 mb-3 md:hidden" onClick={returnToDirectory}>
              <ArrowLeft aria-hidden="true" className="size-4" /> Annuaire
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <PlayerInitials name={selectedPlayer.name} className="size-14 text-xl sm:size-16 sm:text-2xl" />
                <div className="min-w-0 space-y-1">
                  <h2 ref={profileHeading} id="player-profile-heading" tabIndex={-1} className="break-words text-xl font-bold tracking-tight focus:outline-none sm:text-2xl">
                    {selectedPlayer.name}
                  </h2>
                  <p className="break-words text-sm text-muted-foreground">
                    {selectedPlayer.club === "—" ? "Club non renseigné" : selectedPlayer.club}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="h-10">
                <Link href={`/admin/tournoi/ajout-player?edit=${encodeURIComponent(selectedPlayer.id)}`}>
                  <Pencil aria-hidden="true" className="size-4" /> Modifier la fiche
                </Link>
              </Button>
            </div>
          </div>
          <div className="divide-y px-5 sm:px-6">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-4 py-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Dossard</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">#{selectedPlayer.dossard}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Licence FFTT</dt>
                <dd className="mt-1 break-all text-lg font-semibold tabular-nums">{selectedPlayer.licence || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Points</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {selectedPlayer.ranking === "—" ? "—" : numberFormatter.format(Number(selectedPlayer.ranking))}
                </dd>
              </div>
            </dl>
            <div className="space-y-3 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Participation au tournoi</h3>
                <span className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium">{selectedPlayer.status}</span>
              </div>
              {selectedPlayer.statusDetail && <p className="text-xs text-muted-foreground">{selectedPlayer.statusDetail}</p>}
              <div className="flex flex-wrap gap-1.5" aria-label="Tableaux">
                {selectedPlayer.table === "—" ? (
                  <p className="text-sm text-muted-foreground">Aucun tableau</p>
                ) : selectedPlayer.table.split(", ").map((code) => (
                  <span key={code} className="rounded-md border px-2.5 py-1 text-xs font-medium">{code}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-4">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="font-medium">Paiement</span>
                <span className="text-muted-foreground">{selectedPlayer.fullyRefunded ? "Remboursé" : selectedPlayer.payment}</span>
              </div>
              <Link
                href={`/admin/tournoi/paiement?dossier=${encodeURIComponent(selectedPlayer.paymentGroupKey)}`}
                className="inline-flex min-h-9 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                Voir le dossier <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="hidden min-h-64 place-content-center gap-3 rounded-xl border border-dashed text-center text-sm text-muted-foreground md:grid">
          <UsersRound aria-hidden="true" className="mx-auto size-6" />
          <p>Aucune fiche à afficher</p>
        </div>
      )}
    </div>
  );
}
