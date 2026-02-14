"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AuthButtonProps = {
  collapsed?: boolean;
};

export default function AuthButton({ collapsed = false }: AuthButtonProps) {
  const { data: session, status } = useSession();

  // Chargement
  if (status === "loading") {
    return (
      <div className={cn("mt-6 text-sm text-muted-foreground", collapsed && "text-center text-xs")}>Chargement...</div>
    );
  }

  // PAS CONNECTÉ
  if (!session) {
    return (
      <div className="mt-6">
        <button
          onClick={() => signIn("google")}
          className={cn(
            "cursor-pointer w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition",
            collapsed && "px-2 text-xs",
          )}
        >
          {collapsed ? "Login" : "Se connecter"}
        </button>
      </div>
    );
  }

  // CONNECTÉ
  return (
    <div
      className={cn(
        "mt-6 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3",
        collapsed && "p-2",
      )}
    >
      <div className={cn("flex items-center gap-3", collapsed && "justify-center") }>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="Avatar"
            width={40}
            height={40}
            className={cn("rounded-full", collapsed && "h-8 w-8")}
          />
        )}

        <div className={cn("flex flex-col text-sm", collapsed && "hidden")}>
          <span className="font-semibold leading-tight">
            {session.user?.name}
          </span>
          <span className="text-xs text-sidebar-foreground/60">
            {session.user?.email}
          </span>
        </div>
      </div>

      <div className={cn("mt-3 flex flex-col gap-2", collapsed && "hidden")}>
        <Link
          href="/espace"
          className="rounded-md border border-sidebar-border bg-background px-3 py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Mon espace
        </Link>

        <button
          onClick={() => signOut()}
          className="cursor-pointer rounded-md border border-sidebar-border px-3 py-2 text-xs transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
