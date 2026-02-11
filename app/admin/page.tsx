import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  // 🔒 PAS CONNECTÉ
  if (!session) {
    redirect("/api/auth/signin");
  }

  // 🔒 CONNECTÉ MAIS PAS ADMIN
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Administration</h1>

      <div className="rounded-xl border p-6 bg-white shadow-sm">
        <p className="text-gray-700">
          Bienvenue dans l’espace administrateur du club.
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Cet espace est séparé en deux blocs&nbsp;: l&apos;administration du club
          (messages et utilisateurs) et l&apos;administration tournoi (dashboard,
          inscriptions, paiements, pointages, joueurs et exports).
        </p>
      </div>
    </div>
  );
}
