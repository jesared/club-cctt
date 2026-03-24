import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

function parseDate(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    description?: string | null;
    venue?: string | null;
    registrationOpenAt?: string | null;
    registrationCloseAt?: string | null;
    startDate?: string;
    endDate?: string;
    status?: string;
  };

  const slug = (body.slug ?? "").trim();
  const name = (body.name ?? "").trim();

  if (!slug || !name) {
    return NextResponse.json(
      { error: "Slug et nom requis." },
      { status: 400 },
    );
  }

  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Dates de début et fin requises." },
      { status: 400 },
    );
  }

  const template = await prisma.tournamentTemplate.upsert({
    where: { id: "default" },
    update: {
      slug,
      name,
      description: body.description ?? null,
      venue: body.venue ?? null,
      registrationOpenAt: parseDate(body.registrationOpenAt),
      registrationCloseAt: parseDate(body.registrationCloseAt),
      startDate,
      endDate,
      status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    },
    create: {
      id: "default",
      slug,
      name,
      description: body.description ?? null,
      venue: body.venue ?? null,
      registrationOpenAt: parseDate(body.registrationOpenAt),
      registrationCloseAt: parseDate(body.registrationCloseAt),
      startDate,
      endDate,
      status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    },
  });

  return NextResponse.json({ template });
}
