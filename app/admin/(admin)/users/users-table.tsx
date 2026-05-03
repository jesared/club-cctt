"use client";

import { useState, type MouseEvent } from "react";
import { useFormStatus } from "react-dom";
import {
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  Check,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type RoleFilter = "ALL" | ManagedRole;

type ResolvedUser = UserRow & {
  managedRole: ManagedRole;
  isProtected: boolean;
};

const ROLE_META: Record<
  ManagedRole,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  USER: { label: "Membre", variant: "outline" },
  CLUB: { label: "Club", variant: "secondary" },
  ADMIN: { label: "Administrateur", variant: "default" },
};

export default function UsersTable({
  users,
  updateUserRole,
  deleteUser,
  managedRoles,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const resolvedUsers: ResolvedUser[] = users.map((user) => ({
    ...user,
    managedRole: managedRoles.includes(user.role as ManagedRole)
      ? (user.role as ManagedRole)
      : "USER",
    isProtected: user.role === "ADMIN",
  }));

  const filteredUsers = resolvedUsers.filter((user) => {
    const matchesRole =
      roleFilter === "ALL" ? true : user.managedRole === roleFilter;
    const haystack = [
      user.name ?? "",
      user.email ?? "",
      ROLE_META[user.managedRole].label,
      user.managedRole,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = normalizedSearchTerm
      ? haystack.includes(normalizedSearchTerm)
      : true;

    return matchesRole && matchesSearch;
  });

  const filteredStats = {
    visible: filteredUsers.length,
    admins: filteredUsers.filter((user) => user.managedRole === "ADMIN").length,
    clubs: filteredUsers.filter((user) => user.managedRole === "CLUB").length,
    members: filteredUsers.filter((user) => user.managedRole === "USER").length,
    players: filteredUsers.reduce(
      (total, user) => total + user.players.length,
      0,
    ),
  };

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Utilisateurs</CardTitle>
            <CardDescription>
              Une vue compacte pour verifier les roles, les emails et les
              comptes rattaches a des joueurs.
            </CardDescription>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            <Users className="h-3.5 w-3.5" />
            {users.length} comptes geres
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recherche
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="admin-input h-10 pl-9"
                placeholder="Nom, email ou role"
                aria-label="Rechercher un utilisateur"
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Filtre role
            </span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="admin-select h-10"
              aria-label="Filtrer par role"
            >
              <option value="ALL">Tous les roles</option>
              {managedRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_META[role].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterStat label="Visibles" value={filteredStats.visible} />
          <FilterStat label="Admins" value={filteredStats.admins} />
          <FilterStat label="Clubs" value={filteredStats.clubs} />
          <FilterStat label="Membres" value={filteredStats.members} />
          <FilterStat label="Licencies" value={filteredStats.players} />
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredUsers.map((user) => (
                <MobileUserCard
                  key={user.id}
                  user={user}
                  managedRoles={managedRoles}
                  updateUserRole={updateUserRole}
                  deleteUser={deleteUser}
                />
              ))}
            </div>

            <div className="hidden md:block">
              <Table className="table-fixed">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-muted/30">
                    <TableHead className="h-9 w-[22%]">Nom</TableHead>
                    <TableHead className="h-9 w-[30%]">Email</TableHead>
                    <TableHead className="h-9 w-[14%]">Role</TableHead>
                    <TableHead className="h-9 w-[10%]">Licencies</TableHead>
                    <TableHead className="h-9 w-[24%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <DesktopUserRow
                      key={user.id}
                      user={user}
                      managedRoles={managedRoles}
                      updateUserRole={updateUserRole}
                      deleteUser={deleteUser}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DesktopUserRow({
  user,
  managedRoles,
  updateUserRole,
  deleteUser,
}: {
  user: ResolvedUser;
  managedRoles: ManagedRole[];
  updateUserRole: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
}) {
  const roleMeta = ROLE_META[user.managedRole];

  return (
    <TableRow key={user.id} className="align-middle">
      <TableCell className="py-3 pr-3">
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">
            {user.name || "Compte sans nom"}
          </p>
        </div>
      </TableCell>

      <TableCell className="py-3 pr-3 text-muted-foreground">
        <div className="truncate" title={user.email || "Aucun email"}>
          {user.email || "Aucun email"}
        </div>
      </TableCell>

      <TableCell className="py-3 pr-3">
        <Badge variant={roleMeta.variant} className="rounded-full px-2.5 py-1">
          {roleMeta.label}
        </Badge>
      </TableCell>

      <TableCell className="py-3 pr-3">
        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
          {user.players.length}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <RoleActionForm
              user={user}
              managedRoles={managedRoles}
              updateUserRole={updateUserRole}
              compact
            />
            <DeleteActionForm
              user={user}
              deleteUser={deleteUser}
              compact
            />
          </div>

          {user.isProtected ? (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protege
            </div>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

function MobileUserCard({
  user,
  managedRoles,
  updateUserRole,
  deleteUser,
}: {
  user: ResolvedUser;
  managedRoles: ManagedRole[];
  updateUserRole: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
}) {
  const roleMeta = ROLE_META[user.managedRole];

  return (
    <div className="rounded-2xl border border-border/70 bg-background/85 p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">
            {user.name || "Compte sans nom"}
          </p>
          <p className="break-all text-sm text-muted-foreground">
            {user.email || "Aucun email"}
          </p>
        </div>
        <Badge variant={roleMeta.variant} className="rounded-full px-2.5 py-1">
          {roleMeta.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/35 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Licencies rattaches</span>
        <span className="font-semibold text-foreground">{user.players.length}</span>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-xl border border-border/70 bg-background p-3">
          <div className="mb-2 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Role du compte
            </p>
            <p className="text-xs text-muted-foreground">
              Action principale pour ajuster les acces.
            </p>
          </div>
          <RoleActionForm
            user={user}
            managedRoles={managedRoles}
            updateUserRole={updateUserRole}
          />
        </div>

        <div className="rounded-xl border border-dashed border-destructive/35 bg-destructive/5 p-3">
          <div className="mb-2 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive/80">
              Action sensible
            </p>
            <p className="text-xs text-muted-foreground">
              La suppression efface le compte utilisateur.
            </p>
          </div>
          <DeleteActionForm user={user} deleteUser={deleteUser} />

          {user.isProtected ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ce compte administrateur est verrouille.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoleActionForm({
  user,
  managedRoles,
  updateUserRole,
  compact = false,
}: {
  user: ResolvedUser;
  managedRoles: ManagedRole[];
  updateUserRole: (formData: FormData) => Promise<void>;
  compact?: boolean;
}) {
  return (
    <form
      action={updateUserRole}
      className={
        compact
          ? "flex items-center gap-1.5"
          : "flex flex-col gap-2 sm:flex-row sm:items-center"
      }
    >
      <input type="hidden" name="userId" value={user.id} />
      <select
        name="role"
        className={
          compact
            ? "admin-select h-8 min-w-[7rem] max-w-[7rem] py-1.5 pr-7 pl-2 text-[11px]"
            : "admin-select h-9 min-w-[10rem] py-2 text-xs"
        }
        defaultValue={user.managedRole}
        disabled={user.isProtected}
        aria-label={`Choisir le role pour ${
          user.name || user.email || "cet utilisateur"
        }`}
      >
        {managedRoles.map((role) => (
          <option key={role} value={role}>
            {ROLE_META[role].label}
          </option>
        ))}
      </select>

      <RoleSubmitButton disabled={user.isProtected} compact={compact} />
    </form>
  );
}

function DeleteActionForm({
  user,
  deleteUser,
  compact = false,
}: {
  user: ResolvedUser;
  deleteUser: (formData: FormData) => Promise<void>;
  compact?: boolean;
}) {
  return (
    <form action={deleteUser} className={compact ? "inline-flex" : undefined}>
      <input type="hidden" name="userId" value={user.id} />
      <DeleteActionButton
        disabled={user.isProtected}
        compact={compact}
        onConfirm={(event) => {
          if (
            !confirm(
              "Supprimer cet utilisateur ? Cette action est definitive.",
            )
          ) {
            event.preventDefault();
          }
        }}
      />
    </form>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-10 text-center">
      <div className="space-y-1">
        <p className="font-medium text-foreground">
          Aucun utilisateur ne correspond a ces filtres.
        </p>
        <p className="text-sm text-muted-foreground">
          Essaie un autre role ou une recherche plus large.
        </p>
      </div>
    </div>
  );
}

function FilterStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function RoleSubmitButton({
  disabled,
  compact = false,
}: {
  disabled: boolean;
  compact?: boolean;
}) {
  const { pending } = useFormStatus();
  const button = (
    <Button
      type="submit"
      size={compact ? "icon" : "sm"}
      disabled={disabled || pending}
      aria-label={pending ? "Enregistrement du role" : "Mettre a jour le role"}
      title={compact ? undefined : pending ? "Enregistrement..." : "Mettre a jour le role"}
      className={
        compact ? "size-8" : "gap-1.5 sm:min-w-[9.5rem]"
      }
    >
      {compact ? (
        <Check className="h-4 w-4" />
      ) : (
        <>
          <UserCog className="h-3.5 w-3.5" />
          {pending ? "Enregistrement..." : "Mettre a jour"}
        </>
      )}
    </Button>
  );

  if (!compact) {
    return button;
  }

  return button;
}

function DeleteActionButton({
  disabled,
  onConfirm,
  compact = false,
}: {
  disabled: boolean;
  onConfirm: (event: MouseEvent<HTMLButtonElement>) => void;
  compact?: boolean;
}) {
  const { pending } = useFormStatus();
  const button = (
    <Button
      type="submit"
      size={compact ? "icon" : "sm"}
      variant="outline"
      disabled={disabled || pending}
      aria-label={pending ? "Suppression du compte" : "Supprimer le compte"}
      title={compact ? undefined : pending ? "Suppression..." : "Supprimer le compte"}
      className={
        compact
          ? "size-8 border-destructive/35 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
          : "gap-1.5 border-destructive/35 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
      }
      onClick={(event) => {
        if (disabled) {
          return;
        }

        onConfirm(event);
      }}
    >
      <Trash2 className={compact ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {compact ? null : pending ? "Suppression..." : "Supprimer le compte"}
    </Button>
  );

  if (!compact) {
    return button;
  }

  return button;
}
