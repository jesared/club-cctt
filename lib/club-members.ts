import { fetchFfttClubMembers } from "@/lib/fftt";
import { prisma } from "@/lib/prisma";

export const CCTT_FFTT_CLUB_NUMBER =
  process.env.FFTT_CLUB_NUMBER?.trim() || "06510112";

export type ClubMemberSyncResult =
  | {
      ok: true;
      clubNumber: string;
      total: number;
      created: number;
      updated: number;
      inactive: number;
    }
  | {
      ok: false;
      reason: "not-configured" | "not-found" | "upstream-error";
      message: string;
    };

export async function syncClubMembersFromFftt(
  clubNumber = CCTT_FFTT_CLUB_NUMBER,
): Promise<ClubMemberSyncResult> {
  const lookup = await fetchFfttClubMembers(clubNumber);

  if (!lookup.ok) {
    return lookup;
  }

  const syncedAt = new Date();
  const licenses = lookup.members.map((member) => member.licence);
  const existingMembers = await prisma.clubMember.findMany({
    where: { licence: { in: licenses } },
    select: { licence: true },
  });
  const existingLicenses = new Set(
    existingMembers.map((member) => member.licence),
  );

  const inactive = await prisma.$transaction(
    async (tx) => {
      const missingMembers = await tx.clubMember.updateMany({
        where: {
          clubNumber,
          licence: { notIn: licenses },
          active: true,
        },
        data: {
          active: false,
          syncedAt,
        },
      });

      for (const member of lookup.members) {
        await tx.clubMember.upsert({
          where: { licence: member.licence },
          create: {
            clubNumber,
            licence: member.licence,
            nom: member.nom,
          prenom: member.prenom,
          points: member.points,
          licenseType: member.licenseType || null,
          category: member.category || null,
          gender: member.gender || null,
            clubName: member.club || null,
            active: true,
            syncedAt,
          },
          update: {
            clubNumber,
            nom: member.nom,
          prenom: member.prenom,
          points: member.points,
          licenseType: member.licenseType || null,
          category: member.category || null,
            gender: member.gender || null,
            clubName: member.club || null,
            active: true,
            syncedAt,
          },
        });
      }

      return missingMembers.count;
    },
    { timeout: 30_000 },
  );

  const created = lookup.members.filter(
    (member) => !existingLicenses.has(member.licence),
  ).length;

  return {
    ok: true,
    clubNumber,
    total: lookup.members.length,
    created,
    updated: lookup.members.length - created,
    inactive,
  };
}
