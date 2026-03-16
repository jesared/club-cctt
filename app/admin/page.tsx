import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Administration</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les espaces club et tournoi depuis un tableau de bord unifié.
          </p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Club</CardTitle>
            <CardDescription>Messages, contenus et utilisateurs du site club.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Tournoi</CardTitle>
            <CardDescription>Inscriptions, paiements, pointages, exports et joueurs.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Suivi</CardTitle>
            <CardDescription>Vision transversale pour piloter l&apos;activité en temps réel.</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Bienvenue dans l&apos;espace administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cet espace est séparé en deux blocs : l&apos;administration du club et l&apos;administration tournoi.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
