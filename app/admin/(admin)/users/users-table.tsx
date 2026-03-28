"use client";

import { useState } from "react";

type ManagedRole = "USER" | "CLUB" | "ADMIN";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  players: { id: string }[];
};

type Props = {
  users: UserRow[];
  updateUserRole: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
  managedRoles: ManagedRole[];
};

export default function UsersTable({
  users,
  updateUserRole,
  deleteUser,
  managedRoles,
}: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card border-b">
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
              const isManagedRole = managedRoles.includes(
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
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
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
                          defaultValue={isManagedRole ? user.role : "USER"}
                          disabled={user.role === "ADMIN"}
                        >
                          {managedRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                          disabled={user.role === "ADMIN"}
                        >
                          Changer rôle
                        </button>
                      </form>

                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
                          disabled={user.role === "ADMIN"}
                          onClick={(event) => {
                            if (user.role === "ADMIN") {
                              return;
                            }
                            const confirmed = confirm(
                              "Supprimer cet utilisateur ?",
                            );
                            if (!confirmed) {
                              event.preventDefault();
                            } else {
                              setPendingDeleteId(user.id);
                            }
                          }}
                        >
                          {pendingDeleteId === user.id ? "..." : "Supprimer"}
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
  );
}
