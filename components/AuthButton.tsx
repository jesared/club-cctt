"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

type AuthButtonProps = {
  collapsed?: boolean;
};

export default function AuthButton({ collapsed = false }: AuthButtonProps) {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState<string>("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  // Chargement
  if (status === "loading") {
    return (
      <div
        className={cn(
          "mt-6 text-sm text-muted-foreground",
          collapsed && "text-center text-xs",
        )}
      >
        Chargement...
      </div>
    );
  }

  // PAS CONNECTÉ
  if (!session) {
    return (
      <div className="mt-6">
        <Button
          onClick={() => signIn("google")}
          className={cn("w-full", collapsed && "px-2 text-xs")}
        >
          {collapsed ? "Login" : "Se connecter"}
        </Button>
        {!collapsed ? (
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Lien magique (Google)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
                className="h-9 flex-1 rounded-md border border-border bg-card px-3 text-sm text-foreground"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!email.trim()) {
                    setEmailStatus("error");
                    return;
                  }
                  setEmailStatus("sending");
                  const result = await signIn("email", {
                    email: email.trim(),
                    redirect: false,
                  });
                  if (result?.ok) {
                    setEmailStatus("sent");
                  } else {
                    setEmailStatus("error");
                  }
                }}
              >
                {emailStatus === "sending" ? "Envoi..." : "Recevoir le lien"}
              </Button>
            </div>
            {emailStatus === "sent" ? (
              <p className="text-xs text-emerald-500">
                Lien envoyé. Vérifiez votre email.
              </p>
            ) : null}
            {emailStatus === "error" ? (
              <p className="text-xs text-destructive">
                Email invalide ou envoi impossible.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  // CONNECTÉ
  return (
    <div
      className={cn(
        "mt-1 mb-8 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3",
        collapsed && "p-2",
      )}
    >
      <div
        className={cn("flex items-center gap-3", collapsed && "justify-center")}
      >
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
        <Button
          variant={"secondary"}
          onClick={() => signOut()}
          className="cursor-pointer rounded-md border border-sidebar-border px-3 py-2 text-xs transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
