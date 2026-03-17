import { ArrowRight, CalendarDays, CreditCard, FileText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickActions = [
  {
    title: "Mes inscriptions",
    description: "Consultez vos joueurs et le statut des engagements.",
    href: "/user/inscriptions",
    icon: CalendarDays,
  },
  {
    title: "Mes paiements",
    description: "Suivez vos règlements et le reste à payer.",
    href: "/user/paiements",
    icon: CreditCard,
  },
  {
    title: "Mes documents",
    description: "Retrouvez vos justificatifs et pièces utiles.",
    href: "/user/documents",
    icon: FileText,
  },
];

export default function UserProfilePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mb-6 flex items-center justify-between ">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard utilisateur</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos inscriptions, paiements et documents depuis un seul
            espace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/tournoi">Voir le tournoi</Link>
          </Button>
          <Button asChild>
            <Link href="/user/inscriptions">Nouvelle action</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Card
              key={action.href}
              className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {action.title}
                </CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="px-0">
                  <Link
                    href={action.href}
                    className="inline-flex items-center gap-2"
                  >
                    Ouvrir
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
