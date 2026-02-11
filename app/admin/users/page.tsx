import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      players: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <p className="text-gray-600 mt-2">
          Liste des comptes inscrits sur la plateforme du club.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Nom</th>
                <th className="text-left font-semibold px-4 py-3">Email</th>
                <th className="text-left font-semibold px-4 py-3">Rôle</th>
                <th className="text-left font-semibold px-4 py-3">Licenciés</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{user.name || "—"}</td>
                  <td className="px-4 py-3">{user.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.players.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
