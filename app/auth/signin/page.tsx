import SignInClient from "./signin-client";

export default function SignInPage() {
  return (
    <main className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-secondary/40 blur-2xl" />
      </div>
      <SignInClient />
      <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <p>Besoin d'aide ? Contactez le club si vous ne recevez pas le lien.</p>
        <a
          href="/"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Retour au site
        </a>
      </div>
    </main>
  );
}
