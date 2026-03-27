"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type ProviderRecord = Record<
  string,
  {
    id: string;
    name: string;
    type: string;
  }
>;

export default function SignInClient() {
  const [providers, setProviders] = useState<ProviderRecord | null>(null);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    getProviders().then((result) => setProviders(result ?? null));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const callbackUrl = searchParams?.get("callbackUrl");
    router.replace(callbackUrl || "/user");
  }, [router, searchParams, status]);

  const hasEmailProvider = providers
    ? Object.values(providers).some((provider) => provider.id === "email")
    : false;

  const googleProvider = providers
    ? Object.values(providers).find((provider) => provider.id === "google")
    : null;

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card/95 p-8 shadow-xl">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
          <Image
            src="/logo.jpg"
            alt="CCTT"
            width={48}
            height={48}
            className="rounded-md"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Connexion</h1>
          <p className="text-sm text-muted-foreground">
            Choisissez votre methode de connexion.
          </p>
        </div>
      </div>

      {googleProvider ? (
        <Button type="button" onClick={() => signIn("google")} className="w-full">
          Se connecter avec Google
        </Button>
      ) : null}

      {hasEmailProvider ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">
              Lien magique
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
                className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
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
                className="sm:w-40"
              >
                {emailStatus === "sending" ? "Envoi..." : "Recevoir le lien"}
              </Button>
            </div>
            {emailStatus === "sent" ? (
              <p className="text-xs text-emerald-500">
                Lien envoye. Verifiez votre email.
              </p>
            ) : null}
            {emailStatus === "error" ? (
              <p className="text-xs text-destructive">
                Email invalide ou envoi impossible.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
