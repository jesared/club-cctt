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
import { ROLE_META, type ManagedRole } from "@/lib/user-roles";

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
    bureau: filteredUsers.filter((user) => user.managedRole === "BUREAU").length,
    entraineurs: filteredUsers.filter((user) => user.managedRole === "ENTRAINEUR").length,
    members: filteredUsers.filter((user) => user.managedRole === "USER").length,
  };

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-3 border-b border-border/60 bg-muted/20 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Utilisateurs</CardTitle>
            <CardDescription className="max-w-2xl text-xs leading-5">
              Une vue compacte pour vérifier les rôles, les emails et les
              comptes rattachés à des joueurs.
            </CardDescription>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            <Users className="h-3.5 w-3.5" />
            {users.length} comptes gérés
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
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
                placeholder="Nom, email ou rôle"
                aria-label="Rechercher un utilisateur"
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Filtre rôle
            </span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="admin-select h-10"
              aria-label="Filtrer par rôle"
            >
              <option value="ALL">Tous les rôles</option>
              {managedRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_META[role].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FilterStat label="Visibles" value={filteredStats.visible} />
          <FilterStat label="Admins" value={filteredStats.admins} />
          <FilterStat label="Clubs" value={filteredStats.clubs} />
          <FilterStat label="Bureau" value={filteredStats.bureau} />
          <FilterStat label="Entraîneurs" value={filteredStats.entraineurs} />
          <FilterStat label="Membres" value={filteredStats.members} />
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
                    <TableHead className="h-9 w-[22%] px-3">Utilisateur</TableHead>
                    <TableHead className="h-9 w-[25%] px-3">Email</TableHead>
                    <TableHead className="h-9 w-[16%] px-3">Profil</TableHead>
                    <TableHead className="h-9 w-[27%] px-3">Accès</TableHead>
                    <TableHead className="h-9 w-[10%] px-3 text-right">
                      Actions
                    </TableHead>
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
      <TableCell className="px-3 py-3">
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">
            {user.name || "Compte sans nom"}
          </p>
        </div>
      </TableCell>

      <TableCell className="px-3 py-3 text-muted-foreground">
        <div className="truncate text-xs" title={user.email || "Aucun email"}>
          {user.email || "Aucun email"}
        </div>
      </TableCell>

      <TableCell className="px-3 py-3">
        <Badge variant={roleMeta.variant} className="rounded-full px-2 py-0.5 text-[11px]">
          {roleMeta.label}
        </Badge>
      </TableCell>

      <TableCell className="px-3 py-3">
        <div className="space-y-1">
          <RoleActionForm
            user={user}
            managedRoles={managedRoles}
            updateUserRole={updateUserRole}
            compact
          />

          {user.isProtected ? (
            <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Protégé
            </div>
          ) : null}
        </div>
      </TableCell>

      <TableCell className="px-3 py-3 text-right">
        <DeleteActionForm
          user={user}
          deleteUser={deleteUser}
          compact
        />
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
        <span className="text-muted-foreground">Licenciés rattachés</span>
        <span className="font-semibold text-foreground">{user.players.length}</span>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-xl border border-border/70 bg-background p-3">
          <div className="mb-2 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Rôle du compte
            </p>
            <p className="text-xs text-muted-foreground">
              Action principale pour ajuster les accès.
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
              Ce compte administrateur est verrouillé.
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
  const [selectedRole, setSelectedRole] = useState<ManagedRole>(user.managedRole);
  const hasPendingChange = selectedRole !== user.managedRole;

  return (
    <form
      action={updateUserRole}
      className={
        compact
          ? "inline-flex items-center gap-1 rounded-xl border border-border/70 bg-background/80 p-1 shadow-xs"
          : "inline-flex w-full flex-col gap-1 rounded-xl border border-border/70 bg-background/80 p-1 shadow-xs sm:w-fit sm:flex-row"
      }
    >
      <input type="hidden" name="userId" value={user.id} />
      <select
        name="role"
        className={
          compact
            ? `admin-select h-8 min-w-[8rem] max-w-[8rem] rounded-lg border-0 bg-transparent py-1 pl-2 pr-7 text-xs shadow-none hover:bg-transparent focus:bg-transparent ${
                hasPendingChange
                  ? "ring-1 ring-amber-400/50"
                  : ""
              }`
            : `admin-select h-9 min-w-[10rem] rounded-lg border-0 bg-transparent py-2 text-xs shadow-none hover:bg-transparent focus:bg-transparent ${
                hasPendingChange
                  ? "ring-1 ring-amber-400/50"
                  : ""
              }`
        }
        value={selectedRole}
        onChange={(event) => setSelectedRole(event.target.value as ManagedRole)}
        disabled={user.isProtected}
        aria-label={`Choisir le rôle pour ${
          user.name || user.email || "cet utilisateur"
        }`}
      >
        {managedRoles.map((role) => (
          <option key={role} value={role}>
            {ROLE_META[role].label}
          </option>
        ))}
      </select>

      <RoleSubmitButton
        disabled={user.isProtected}
        compact={compact}
        hasPendingChange={hasPendingChange}
      />
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
              "Supprimer cet utilisateur ? Cette action est définitive.",
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
          Aucun utilisateur ne correspond à ces filtres.
        </p>
        <p className="text-sm text-muted-foreground">
          Essaie un autre rôle ou une recherche plus large.
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
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground shadow-xs">
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function RoleSubmitButton({
  disabled,
  compact = false,
  hasPendingChange = false,
}: {
  disabled: boolean;
  compact?: boolean;
  hasPendingChange?: boolean;
}) {
  const { pending } = useFormStatus();
  const button = (
    <Button
      type="submit"
      size={compact ? "icon" : "sm"}
      disabled={disabled || pending || !hasPendingChange}
      aria-label={
        pending
          ? "Enregistrement du rôle"
          : hasPendingChange
            ? "Valider le changement de rôle"
            : "Modifiez le rôle pour pouvoir valider"
      }
      title={
        pending
          ? "Enregistrement..."
          : hasPendingChange
            ? "Valider le changement de rôle"
            : "Modifiez le rôle pour pouvoir valider"
      }
      className={
        compact
          ? `size-8 rounded-lg shadow-none ${
              hasPendingChange
                ? "bg-amber-500 text-amber-950 hover:bg-amber-400"
                : ""
            }`
          : `gap-1.5 sm:min-w-[9.5rem] ${
              hasPendingChange
                ? "bg-amber-500 text-amber-950 hover:bg-amber-400"
                : ""
            }`
      }
    >
      {compact ? (
        <Check className="h-4 w-4" />
      ) : (
        <>
          <UserCog className="h-3.5 w-3.5" />
          {pending
            ? "Enregistrement..."
            : hasPendingChange
              ? "Valider"
              : "Mettre à jour"}
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
