import Link from "next/link";
import NotFoundAnimation from "./not-found-animation";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <NotFoundAnimation />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Erreur 404
      </p>
      <h1 className="text-3xl font-semibold">Page introuvable</h1>
      <p className="text-sm text-muted-foreground">
        Cette page n&apos;existe pas ou a été déplacée. Vérifiez l&apos;adresse ou
        revenez au site.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className={buttonVariants({ variant: "default", size: "lg" })}
        >
          Retour a l&apos;accueil
        </Link>
        <Link
          href="/tournoi"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Page tournoi
        </Link>
        <Link
          href="/club/contact"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
