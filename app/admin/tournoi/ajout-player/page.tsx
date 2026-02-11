import Link from "next/link";
import { FFTTPlayerLookupForm } from "./fftt-player-lookup-form";
import { requireAdminSession } from "../_components";

const NAV_LINKS = [
  { href: "/admin/tournoi", label: "Dashboard" },
  { href: "/admin/tournoi/inscriptions", label: "Inscriptions" },
  { href: "/admin/tournoi/paiement", label: "Paiements" },
  { href: "/admin/tournoi/pointages", label: "Pointages" },
  { href: "/admin/tournoi/joueurs", label: "Joueurs" },
  { href: "/admin/tournoi/ajout-player", label: "Ajouter un joueur" },
  { href: "/admin/tournoi/exports", label: "Exports" },
] as const;

export default async function AdminTournoiAjoutPlayerPage() {
  await requireAdminSession();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-red-600">Administration tournoi</p>
        <h1 className="text-3xl font-bold">Ajouter un joueur</h1>
        <p className="text-gray-600">
          Recherche FFTT par numéro de licence pour pré-remplir rapidement
          l'inscription d'un joueur sur place.
        </p>
      </header>

      <section className="rounded-xl border bg-white shadow-sm p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Navigation rapide
        </h2>
        <div className="flex flex-wrap gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/admin/tournoi/ajout-player";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </section>

      <FFTTPlayerLookupForm />

      <section className="rounded-xl border bg-white shadow-sm p-6 text-sm text-gray-700 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Configuration attendue</h2>
        <p>
          La route interne <code>/api/fftt/player-by-licence</code> appelle
          l'endpoint Smartping <code>xml_licence_b.php</code> via la configuration FFTT.
        </p>
        <p>
          Variables minimales attendues : <code>FFTT_API_SERIE</code>, <code>FFTT_API_ID</code>,
          <code>FFTT_API_PASSWORD</code>.
        </p>
      </section>
    </div>
  );
}
