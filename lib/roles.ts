export type NormalizedRole = "admin" | "user";

export function normalizeRole(role: unknown): NormalizedRole {
  if (typeof role !== "string") {
    return "user";
  }

  return role.toLowerCase() === "admin" ? "admin" : "user";
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === "admin";
}
