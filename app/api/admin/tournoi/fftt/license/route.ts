import { authOptions } from "@/lib/auth";
import { fetchFfttPlayerByLicense } from "@/lib/fftt";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const licence = searchParams.get("licence")?.trim() ?? "";

  if (!/^\d{6,20}$/.test(licence)) {
    return NextResponse.json(
      { error: "Numero de licence invalide." },
      { status: 400 },
    );
  }

  const result = await fetchFfttPlayerByLicense(licence);

  if (result.ok) {
    return NextResponse.json({ player: result.player });
  }

  const statusByReason = {
    "not-configured": 503,
    "not-found": 404,
    "upstream-error": 502,
  } satisfies Record<typeof result.reason, number>;

  return NextResponse.json(
    { error: result.message, reason: result.reason },
    { status: statusByReason[result.reason] },
  );
}
