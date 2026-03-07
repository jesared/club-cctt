import {
  CreditCard,
  Flame,
  LayoutGrid,
  LoaderCircle,
  TrendingUp,
  Users,
} from "lucide-react";

type TournamentDashboardProps = {
  tournamentName: string;
  stats: {
    totalPlayers: number;
    paidPlayers: number;
    pendingPayments: number;
    totalTables: number;
    fullTables: number;
    registrationsToday: number;
  };
};

type DashboardCard = {
  label: string;
  value: number;
  description: string;
  Icon: typeof Users;
};

export function TournamentDashboard({ tournamentName, stats }: TournamentDashboardProps) {
  const cards: DashboardCard[] = [
    {
      label: "Joueurs inscrits",
      value: stats.totalPlayers,
      description: "Nombre total de joueurs inscrits",
      Icon: Users,
    },
    {
      label: "Paiements validés",
      value: stats.paidPlayers,
      description: "Inscriptions avec paiement confirmé",
      Icon: CreditCard,
    },
    {
      label: "Paiements en attente",
      value: stats.pendingPayments,
      description: "Inscriptions sans paiement validé",
      Icon: LoaderCircle,
    },
    {
      label: "Tableaux",
      value: stats.totalTables,
      description: "Nombre de tableaux du tournoi",
      Icon: LayoutGrid,
    },
    {
      label: "Tableaux complets",
      value: stats.fullTables,
      description: "Tableaux ayant atteint la capacité max",
      Icon: Flame,
    },
    {
      label: "Inscriptions aujourd'hui",
      value: stats.registrationsToday,
      description: "Nouvelles inscriptions depuis minuit",
      Icon: TrendingUp,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{tournamentName}</h2>
        <p className="text-sm text-muted-foreground">Dashboard rapide du tournoi</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map(({ label, value, description, Icon }) => (
          <article
            key={label}
            className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
              </div>
              <div className="rounded-lg bg-secondary p-2 text-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
