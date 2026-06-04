import type { Metadata } from "next";

import Providers from "@/components/Providers";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getPublicMenuVisibility } from "@/lib/menu-settings";
import { prisma } from "@/lib/prisma";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
import { ACTIVE_TOURNAMENT_STATUSES } from "@/lib/tournament-status";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://cctt.fr",
  ),
  title: "Chalons-en-Champagne Tennis de Table",
  description: "Club de tennis de table a Chalons-en-Champagne",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuVisibility, tournament] = await Promise.all([
    getPublicMenuVisibility(),
    prisma.tournament.findFirst({
      where: { status: { in: ACTIVE_TOURNAMENT_STATUSES } },
      orderBy: [{ startDate: "desc" }],
      select: {
        status: true,
        registrationOpenAt: true,
        registrationCloseAt: true,
      },
    }),
  ]);
  const registrationStatus = getTournamentRegistrationStatus(tournament);

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header
              menuVisibility={menuVisibility}
              showTournamentRegistration={registrationStatus.canRegister}
            />
            <main className="flex-1">{children}</main>
            <Footer menuVisibility={menuVisibility} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
