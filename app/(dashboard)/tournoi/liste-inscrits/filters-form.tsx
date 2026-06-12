"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Building2, ListFilter, Trophy, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";

type FilterOption = {
  label: string;
  value: string;
};

type FiltersFormProps = {
  selectedTableau: string;
  selectedClub: string;
  tableauOptions: FilterOption[];
  clubOptions: FilterOption[];
};

function findLabel(options: FilterOption[], value: string, fallback: string) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

export function FiltersForm({
  selectedTableau,
  selectedClub,
  tableauOptions,
  clubOptions,
}: FiltersFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (name: "tableau" | "club", value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectedTableauLabel = findLabel(
    tableauOptions,
    selectedTableau,
    "Tous les tableaux",
  );
  const selectedClubLabel = findLabel(clubOptions, selectedClub, "Tous les clubs");
  const hasTableauFilter = selectedTableau !== "all";
  const hasClubFilter = selectedClub !== "all";

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Trophy className="h-4 w-4 text-primary" />
            Filtrer par tableau
          </span>
          <InputGroup>
            <InputGroupAddon>Tableau</InputGroupAddon>
            <select
              name="tableau"
              value={selectedTableau}
              onChange={(event) => updateFilter("tableau", event.target.value)}
              className="h-11 w-full bg-transparent px-3 text-sm text-foreground outline-none"
            >
              {tableauOptions.map((tableau) => (
                <option key={tableau.value} value={tableau.value}>
                  {tableau.label}
                </option>
              ))}
            </select>
          </InputGroup>
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Filtrer par club
          </span>
          <InputGroup>
            <InputGroupAddon>Club</InputGroupAddon>
            <select
              name="club"
              value={selectedClub}
              onChange={(event) => updateFilter("club", event.target.value)}
              className="h-11 w-full bg-transparent px-3 text-sm text-foreground outline-none"
            >
              {clubOptions.map((club) => (
                <option key={club.value} value={club.value}>
                  {club.label}
                </option>
              ))}
            </select>
          </InputGroup>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <ListFilter className="h-3.5 w-3.5" />
          Filtres :
        </span>
        <Badge variant="secondary" className="gap-1">
          Tableau : {selectedTableauLabel}
          {hasTableauFilter ? (
            <button
              type="button"
              onClick={() => updateFilter("tableau", "all")}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
              aria-label="Retirer le filtre tableau"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          Club : {selectedClubLabel}
          {hasClubFilter ? (
            <button
              type="button"
              onClick={() => updateFilter("club", "all")}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
              aria-label="Retirer le filtre club"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </Badge>
      </div>
    </div>
  );
}
