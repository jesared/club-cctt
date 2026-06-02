export type NormalizedRole = "admin" | "user";
export type ManagedRole = "USER" | "CLUB" | "BUREAU" | "ENTRAINEUR" | "ADMIN";

const ROLE_LABELS: Record<ManagedRole, string> = {
  USER: "Membre",
  CLUB: "Club",
  BUREAU: "Bureau",
  ENTRAINEUR: "Entraîneur",
  ADMIN: "Administrateur",
};

const MANAGED_ROLE_SET = new Set<ManagedRole>([
  "USER",
  "CLUB",
  "BUREAU",
  "ENTRAINEUR",
  "ADMIN",
]);

export function getManagedRole(role: unknown): ManagedRole {
  if (typeof role !== "string") {
    return "USER";
  }

  const normalized = role.toUpperCase();
  return MANAGED_ROLE_SET.has(normalized as ManagedRole)
    ? (normalized as ManagedRole)
    : "USER";
}

export function getRoleLabel(role: unknown): string {
  return ROLE_LABELS[getManagedRole(role)];
}

export function normalizeRole(role: unknown): NormalizedRole {
  return getManagedRole(role) === "ADMIN" ? "admin" : "user";
}

export function hasRole(role: unknown, expectedRole: ManagedRole): boolean {
  return getManagedRole(role) === expectedRole;
}

export function hasAnyRole(
  role: unknown,
  expectedRoles: readonly ManagedRole[],
): boolean {
  const managedRole = getManagedRole(role);
  return expectedRoles.includes(managedRole);
}

export function isAdminRole(role: unknown): boolean {
  return hasRole(role, "ADMIN");
}

export function canAccessClubSpace(role: unknown): boolean {
  return hasAnyRole(role, ["CLUB", "BUREAU", "ENTRAINEUR", "ADMIN"]);
}

export function canAccessBureauSpace(role: unknown): boolean {
  return hasAnyRole(role, ["BUREAU", "ADMIN"]);
}

export function canAccessEntraineurSpace(role: unknown): boolean {
  return hasAnyRole(role, ["ENTRAINEUR", "ADMIN"]);
}
