"use client";

import { useEffect, useState } from "react";
import { AlertCircle, MailCheck } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!session) {
      return;
    }

    const callbackUrl = searchParams?.get("callbackUrl");
    router.replace(callbackUrl || "/user");
  }, [router, searchParams, session]);

  const reason = searchParams?.get("reason");

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/95 shadow-xl">
      <CardHeader className="space-y-6">
        {reason === "auth" ? (
          <Alert className="border-primary/30 bg-primary/10 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connectez-vous pour acceder a cette page.
            </AlertDescription>
          </Alert>
        ) : null}

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
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Choisissez votre methode de connexion.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Button
          type="button"
          onClick={() =>
            void authClient.signIn.social({
              provider: "google",
              callbackURL: searchParams?.get("callbackUrl") || "/user",
            })
          }
          className="w-full"
        >
          Se connecter avec Google
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Separator className="flex-1" />
          <span>ou</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="magic-link-email" className="text-xs text-muted-foreground">
            Lien magique
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="magic-link-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.com"
              className="flex-1 bg-background"
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
                const result = await authClient.signIn.magicLink({
                  email: email.trim(),
                  callbackURL: searchParams?.get("callbackUrl") || "/user",
                });

                if (!result.error) {
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
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <MailCheck className="h-4 w-4" />
              <AlertDescription>
                Lien envoye. Verifiez votre email.
              </AlertDescription>
            </Alert>
          ) : null}

          {emailStatus === "error" ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Email invalide ou envoi impossible.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
