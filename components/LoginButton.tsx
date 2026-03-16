"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Button onClick={() => signIn("google")}>Se connecter</Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Bonjour {session.user?.name}</span>
      <Button onClick={() => signOut()} variant="outline" size="sm">Déconnexion</Button>
    </div>
  );
}
