import ParametresClient from "./parametres-client";

export default function UserParametresPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Paramètres</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos préférences et informations de compte.
          </p>
        </div>
      </header>

      <ParametresClient />
    </main>
  );
}
