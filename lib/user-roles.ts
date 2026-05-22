export const MANAGED_ROLES = [
  "USER",
  "CLUB",
  "BUREAU",
  "ENTRAINEUR",
  "ADMIN",
] as const;

export type ManagedRole = (typeof MANAGED_ROLES)[number];

export const ROLE_META: Record<
  ManagedRole,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  USER: { label: "Membre", variant: "outline" },
  CLUB: { label: "Club", variant: "secondary" },
  BUREAU: { label: "Bureau", variant: "secondary" },
  ENTRAINEUR: { label: "Entraîneur", variant: "outline" },
  ADMIN: { label: "Administrateur", variant: "default" },
};
