import { prisma } from "@/lib/prisma";

export const PUBLIC_MENU_KEYS = ["tournoi"] as const;

export type PublicMenuKey = (typeof PUBLIC_MENU_KEYS)[number];

export type PublicMenuVisibility = Record<PublicMenuKey, boolean>;

const defaultPublicMenuVisibility: PublicMenuVisibility = {
  tournoi: true,
};

type MenuVisibilityRow = {
  key: string;
  enabled: boolean;
};

export function getDefaultPublicMenuVisibility(): PublicMenuVisibility {
  return { ...defaultPublicMenuVisibility };
}

export async function getPublicMenuVisibility(): Promise<PublicMenuVisibility> {
  try {
    const rows = await prisma.$queryRaw<MenuVisibilityRow[]>`
      SELECT "key", "enabled"
      FROM "MenuVisibility"
    `;

    return rows.reduce<PublicMenuVisibility>(
      (visibility, row) => {
        if (isPublicMenuKey(row.key)) {
          visibility[row.key] = row.enabled;
        }

        return visibility;
      },
      getDefaultPublicMenuVisibility(),
    );
  } catch {
    return getDefaultPublicMenuVisibility();
  }
}

export async function updatePublicMenuVisibility(
  key: PublicMenuKey,
  enabled: boolean,
) {
  await prisma.$executeRaw`
    INSERT INTO "MenuVisibility" ("key", "label", "enabled", "createdAt", "updatedAt")
    VALUES (${key}, ${getPublicMenuLabel(key)}, ${enabled}, NOW(), NOW())
    ON CONFLICT ("key") DO UPDATE
    SET "enabled" = ${enabled}, "updatedAt" = NOW()
  `;
}

export function isPublicMenuVisible(
  visibility: PublicMenuVisibility | undefined,
  key: PublicMenuKey,
) {
  return visibility?.[key] ?? defaultPublicMenuVisibility[key];
}

function isPublicMenuKey(key: string): key is PublicMenuKey {
  return PUBLIC_MENU_KEYS.includes(key as PublicMenuKey);
}

function getPublicMenuLabel(key: PublicMenuKey) {
  if (key === "tournoi") {
    return "Menu Tournoi";
  }

  return key;
}
