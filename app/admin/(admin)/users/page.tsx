import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Role } from "@prisma/client";
import UsersTable from "./users-table";

const MANAGED_ROLES = ["USER", "CLUB", "ADMIN"] as const;

type ManagedRole = (typeof MANAGED_ROLES)[number];

type UsersPageSearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getFeedbackBanner(searchParams: UsersPageSearchParams) {
  const notice = getSingleParam(searchParams.notice);
  const error = getSingleParam(searchParams.error);

  if (notice === "role-updated") {
    return {
      tone: "success" as const,
      title: "Role mis a jour",
      description: "Les droits de l'utilisateur ont bien ete enregistres.",
    };
  }

  if (notice === "user-deleted") {
    return {
      tone: "success" as const,
      title: "Compte supprime",
      description: "Le compte utilisateur a bien ete retire de la liste.",
    };
  }

  if (error === "invalid-role") {
    return {
      tone: "error" as const,
      title: "Role invalide",
      description:
        "Le role demande n'est pas autorise depuis cette interface.",
    };
  }

  if (error === "invalid-user") {
    return {
      tone: "error" as const,
      title: "Utilisateur introuvable",
      description:
        "L'action n'a pas pu aboutir car le compte cible est introuvable.",
    };
  }

  if (error === "protected-admin") {
    return {
      tone: "error" as const,
      title: "Compte protege",
      description:
        "Les comptes administrateurs ne peuvent pas etre modifies ou supprimes depuis cette page.",
    };
  }

  return null;
}

async function updateUserRole(formData: FormData) {
  "use server";

  await requireAdminSession();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || typeof role !== "string") {
    redirect("/admin/users?error=invalid-user");
  }

  if (!MANAGED_ROLES.includes(role as ManagedRole)) {
    redirect("/admin/users?error=invalid-role");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!existingUser) {
    redirect("/admin/users?error=invalid-user");
  }

  if (existingUser.role === "ADMIN") {
    redirect("/admin/users?error=protected-admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as Role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?notice=role-updated");
}

async function deleteUser(formData: FormData) {
  "use server";

  await requireAdminSession();

  const userId = formData.get("userId");

  if (typeof userId !== "string") {
    redirect("/admin/users?error=invalid-user");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!existingUser) {
    redirect("/admin/users?error=invalid-user");
  }

  if (existingUser.role === "ADMIN") {
    redirect("/admin/users?error=protected-admin");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?notice=user-deleted");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<UsersPageSearchParams>;
}) {
  await requireAdminSession();

  const resolvedSearchParams = (await searchParams) ?? {};
  const feedbackBanner = getFeedbackBanner(resolvedSearchParams);

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

  const stats = [
    {
      label: "Utilisateurs",
      value: users.length,
      helper: "comptes visibles dans l'admin",
    },
    {
      label: "Admins",
      value: users.filter((user) => user.role === "ADMIN").length,
      helper: "comptes proteges",
    },
    {
      label: "Clubs",
      value: users.filter((user) => user.role === "CLUB").length,
      helper: "comptes structure",
    },
    {
      label: "Licencies",
      value: users.reduce((total, user) => total + user.players.length, 0),
      helper: "joueurs rattaches",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
        <CardHeader className="gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Administration
            </p>
            <CardTitle className="text-3xl">Gestion utilisateurs</CardTitle>
          </div>
          <CardDescription className="max-w-3xl text-sm leading-6">
            Visualise les comptes actifs, verifie leur role et gere rapidement
            les rattachements club ou membre depuis un espace plus lisible.
          </CardDescription>
        </CardHeader>
      </Card>

      {feedbackBanner ? (
        <Card
          className={
            feedbackBanner.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/8"
              : "border-destructive/30 bg-destructive/6"
          }
        >
          <CardContent className="flex items-start gap-3 p-4">
            <div
              className={
                feedbackBanner.tone === "success"
                  ? "text-emerald-600"
                  : "text-destructive"
              }
            >
              {feedbackBanner.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {feedbackBanner.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {feedbackBanner.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/70 bg-card/95 shadow-xs [background-image:none]"
          >
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
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
