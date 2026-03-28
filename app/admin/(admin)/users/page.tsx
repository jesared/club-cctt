import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";

import type { Role } from "@prisma/client";
import UsersTable from "./users-table";

const MANAGED_ROLES = ["USER", "CLUB", "ADMIN"] as const;

type ManagedRole = (typeof MANAGED_ROLES)[number];

async function updateUserRole(formData: FormData) {
  "use server";

  await requireAdminSession();

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
    data: { role: role as Role },
  });

  revalidatePath("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";

  await requireAdminSession();

  const userId = formData.get("userId");

  if (typeof userId !== "string") {
    return;
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  await requireAdminSession();

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
        <p className="text-muted-foreground mt-2">
          Voir les membres connectés et gérer leurs rôles.
        </p>
      </div>

      <UsersTable
        users={users}
        updateUserRole={updateUserRole}
        deleteUser={deleteUser}
        managedRoles={[...MANAGED_ROLES]}
      />
    </div>
  );
}
