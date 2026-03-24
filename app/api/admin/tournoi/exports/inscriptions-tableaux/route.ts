import { authOptions } from "@/lib/auth";
import { getCurrentTournament, getRegistrationsByTable } from "@/app/admin/tournoi/data";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function toCsvValue(value: string | number) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await getCurrentTournament();

  if (!tournament) {
    return NextResponse.json({ error: "No active tournament" }, { status: 404 });
  }

  const rows = await getRegistrationsByTable(tournament.id);

  const header = ["Tableau", "Categorie", "Inscrits", "Liste d'attente"];
  const csv = [
    header.map(toCsvValue).join(";"),
    ...rows.map((row) =>
      [
        toCsvValue(row.table),
        toCsvValue(row.category),
        toCsvValue(row.registrations),
        toCsvValue(row.waitlist),
      ].join(";"),
    ),
  ].join("\n");

  return new NextResponse(`\ufeff${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=inscriptions-tableaux.csv",
    },
  });
}

