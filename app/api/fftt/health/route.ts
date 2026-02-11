import { auth } from "@/auth";
import { healthFFTTConfig } from "@/lib/fftt";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const config = healthFFTTConfig();
  const ok = config.hasSerie && config.hasId && config.hasPassword;

  return NextResponse.json(
    {
      ok,
      config,
    },
    { status: ok ? 200 : 503 }
  );
}
