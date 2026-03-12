import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const EVENT_TYPES = new Set(["VIEW", "CLICK", "START", "SUBMIT"]);

type KpiPayload = {
  eventType?: string;
  page?: string;
  label?: string;
};

export async function POST(request: NextRequest) {
  let payload: KpiPayload;

  try {
    payload = (await request.json()) as KpiPayload;
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const eventType = payload.eventType?.trim().toUpperCase();
  const page = payload.page?.trim();
  const label = payload.label?.trim();

  if (!eventType || !EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ message: "Type d'événement invalide." }, { status: 400 });
  }

  if (!page || page.length < 2 || page.length > 120) {
    return NextResponse.json({ message: "Page invalide." }, { status: 400 });
  }

  if (label && label.length > 150) {
    return NextResponse.json({ message: "Label invalide." }, { status: 400 });
  }

  await prisma.kpiEvent.create({
    data: {
      eventType: eventType as "VIEW" | "CLICK" | "START" | "SUBMIT",
      page,
      label: label || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
