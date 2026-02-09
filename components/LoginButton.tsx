"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
      >
        Se connecter
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Bonjour {session.user?.name}</span>
      <button onClick={() => signOut()} className="border px-3 py-1 rounded-md">
        Déconnexion
      </button>
    </div>
  );
}
