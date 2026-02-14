import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const TOURNAMENT_ADMIN_LINKS = [
  { href: "/admin/tournoi", label: "Dashboard" },
  { href: "/admin/tournoi/inscriptions", label: "Inscriptions" },
  { href: "/admin/tournoi/paiement", label: "Paiements" },
  { href: "/admin/tournoi/pointages", label: "Pointages" },
  { href: "/admin/tournoi/joueurs", label: "Joueurs" },
  { href: "/admin/tournoi/ajout-player", label: "Ajouter un joueur" },
  { href: "/admin/tournoi/exports", label: "Exports" },
] as const;

export async function requireAdminSession() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
}

type TournamentAdminPageProps = {
  title: string;
  description: string;
  activeHref: (typeof TOURNAMENT_ADMIN_LINKS)[number]["href"];
  items?: readonly string[];
  children?: ReactNode;
};

export function TournamentAdminPage({
  title,
  description,
  activeHref,
  items,
  children,
}: TournamentAdminPageProps) {
  return (
    <div className="tournament-shell max-w-6xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-foreground">Administration tournoi</p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      <section className="rounded-xl border bg-card shadow-sm p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Navigation rapide
        </h2>
        <div className="flex flex-wrap gap-2">
          {TOURNAMENT_ADMIN_LINKS.map((link) => {
            const isActive = link.href === activeHref;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-[#ff00c8] bg-[#ff00c8] text-white"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-card shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Contenu MVP</h2>
        {items && items.length > 0 ? (
          <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Cette page est en place pour le menu MVP du tournoi et prête à être
            branchée à la base de données.
          </p>
        )}
      </section>

      {children}
    </div>
  );
}
