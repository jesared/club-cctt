"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Filtrer par tableau</span>
          <select
            name="tableau"
            value={selectedTableau}
            onChange={(event) => updateFilter("tableau", event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {tableauOptions.map((tableau) => (
              <option key={tableau.value} value={tableau.value}>
                {tableau.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Filtrer par club</span>
          <select
            name="club"
            value={selectedClub}
            onChange={(event) => updateFilter("club", event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {clubOptions.map((club) => (
              <option key={club.value} value={club.value}>
                {club.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Filtres :</span>
        <Badge variant="secondary">Tableau : {selectedTableauLabel}</Badge>
        <Badge variant="secondary">Club : {selectedClubLabel}</Badge>
      </div>
    </div>
  );
}
