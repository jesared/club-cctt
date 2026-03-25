import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Erreur 404
      </p>
      <h1 className="text-3xl font-semibold">Page introuvable</h1>
      <p className="text-sm text-muted-foreground">
        Cette page n&apos;existe pas ou a ete deplacee. Verifiez l&apos;adresse ou
        revenez au site.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          Retour a l&apos;accueil
        </Link>
        <Link
          href="/tournoi"
          className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2 text-sm text-foreground hover:bg-muted"
        >
          Page tournoi
        </Link>
        <Link
          href="/club/contact"
          className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2 text-sm text-foreground hover:bg-muted"
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
