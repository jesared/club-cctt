import DashboardSidebar from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Châlons-en-Champagne Tennis de Table",
  description: "Club de tennis de table à Châlons-en-Champagne",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const resolvedTheme = storedTheme === "light" || storedTheme === "cyberpunk"
      ? storedTheme
      : "light";
    document.documentElement.classList.remove("light", "cyberpunk");
    if (resolvedTheme !== "light") {
      document.documentElement.classList.add(resolvedTheme);
    }
  } catch (_) {
    document.documentElement.classList.remove("light", "cyberpunk");
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>
          <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen flex-col lg:flex-row">
              <DashboardSidebar />
              <div className="flex min-h-screen flex-1 flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
