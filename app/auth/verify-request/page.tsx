import Link from "next/link";
import Image from "next/image";

export default function VerifyRequestPage() {
  return (
    <main className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-secondary/40 blur-2xl" />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card/95 p-8 text-center shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
            <Image src="/logo.jpg" alt="CCTT" width={48} height={48} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Vérifiez votre email
            </h1>
            <p className="text-sm text-muted-foreground">
              Un lien de connexion vient d’être envoyé à votre adresse email.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Pensez à vérifier vos spams si vous ne le voyez pas.
        </div>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60"
        >
          Retour au site
        </Link>
      </div>
    </main>
  );
}
