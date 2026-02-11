import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const MANAGED_ROLES = ["JOUEUR", "COACH", "BUREAU"] as const;

type ManagedRole = (typeof MANAGED_ROLES)[number];

async function updateUserRole(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || typeof role !== "string") {
    return;
  }

  if (!MANAGED_ROLES.includes(role as ManagedRole)) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
}

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
        <h1 className="text-3xl font-bold">Gestion utilisateurs</h1>
        <p className="text-gray-600 mt-2">
          Voir les membres connectés et gérer leurs rôles.
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
                <th className="text-left font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isManagedRole = MANAGED_ROLES.includes(
                  user.role as ManagedRole,
                );

                return (
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
                    <td className="px-4 py-3">
                      <div className="flex flex-col md:flex-row gap-2">
                        <form action={updateUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            className="rounded-md border px-2 py-1 text-xs"
                            defaultValue={isManagedRole ? user.role : "JOUEUR"}
                            disabled={user.role === "ADMIN"}
                          >
                            {MANAGED_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                            disabled={user.role === "ADMIN"}
                          >
                            Changer rôle
                          </button>
                        </form>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
