"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  // Chargement
  if (status === "loading") {
    return <div className="mt-6 text-sm text-gray-400">Chargement...</div>;
  }

  // PAS CONNECTÉ
  if (!session) {
    return (
      <div className="mt-6">
        <button
          onClick={() => signIn("google")}
          className="cursor-pointer w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  // CONNECTÉ
  return (
    <div className="mt-6 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
      <div className="flex items-center gap-3">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}

        <div className="flex flex-col text-sm">
          <span className="font-semibold leading-tight">
            {session.user?.name}
          </span>
          <span className="text-xs text-sidebar-foreground/60">
            {session.user?.email}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Link
          href="/espace"
          className="rounded-md bg-white/80 px-3 py-2 text-center text-xs font-medium hover:bg-white"
        >
          Mon espace
        </Link>

        <button
          onClick={() => signOut()}
          className="rounded-md border px-3 py-2 text-xs hover:bg-sidebar-accent cursor-pointer"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
