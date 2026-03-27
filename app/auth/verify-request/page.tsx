import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Vérifiez votre email
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Un lien de connexion vient d’être envoyé à votre adresse email.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Pensez à vérifier vos spams si vous ne le voyez pas.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60"
      >
        Retour au site
      </Link>
    </main>
  );
}
