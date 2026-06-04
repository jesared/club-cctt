import type { TournamentStatus } from "@prisma/client";

export const ACTIVE_TOURNAMENT_STATUSES: TournamentStatus[] = [
  "PUBLISHED",
  "SUSPENDED",
];
