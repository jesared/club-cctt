import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getAdminPlayers, getCurrentTournament, getTournamentTables } from "../data";

export default async function AdminTournoiPaiementPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const [adminPlayers, tournamentTables] = tournament
    ? await Promise.all([
        getAdminPlayers(tournament.id),
        getTournamentTables(tournament.id),
      ])
    : [[], []];

  const onSitePlayers = adminPlayers.filter((player) => player.payment === "Sur place");
  const earlyPlayers = adminPlayers.filter((player) => player.payment === "Anticipé");

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Contrôle des tarifs anticipés / sur place selon les tableaux du tournoi en base."
      activeHref="/admin/tournoi/paiement"
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs anticipés</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{earlyPlayers.length}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs sur place</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{onSitePlayers.length}</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux standard</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tournamentTables.filter((table) => table.earlyPayment === "8€").length}
          </p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux premium</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tournamentTables.filter((table) => table.earlyPayment !== "8€").length}
          </p>
        </article>
      </section>
    </TournamentAdminPage>
  );
}
