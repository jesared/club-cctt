import type { Metadata } from "next";

import Providers from "@/components/Providers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://club.cctt.fr",
  ),
  title: "Châlons-en-Champagne Tennis de Table",
  description: "Club de tennis de table à Châlons-en-Champagne",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased ">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />

            {/* PAGE CONTENT */}
            <main className="flex-1">{children}</main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
