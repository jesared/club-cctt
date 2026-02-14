import { requireAdminSession, TournamentAdminPage } from "../_components";
import {
  getAdminPlayers,
  getCurrentTournament,
  getRegistrationsByTable,
} from "../data";

export default async function AdminTournoiInscriptionsPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const [registrationsByTable, adminPlayers] = tournament
    ? await Promise.all([
        getRegistrationsByTable(tournament.id),
        getAdminPlayers(tournament.id),
      ])
    : [[], []];

  const totalRegistrations = registrationsByTable.reduce((sum, row) => sum + row.registrations, 0);
  const totalWaitlist = registrationsByTable.reduce((sum, row) => sum + row.waitlist, 0);
  const totalCheckins = registrationsByTable.reduce((sum, row) => sum + row.checkins, 0);
  const toFollowUp = adminPlayers.filter((player) => player.status === "À confirmer").length;

  return (
    <TournamentAdminPage
      title="Inscriptions"
      description="Suivi détaillé des engagements par tableau avec les données Player/TournamentRegistration."
      activeHref="/admin/tournoi/inscriptions"
      items={[
        "Pilotage des inscriptions par tableau avec focus capacité et attente.",
        "Priorisation des dossiers à pointer et des paiements sur place.",
        "Vue rapide des joueurs à relancer avant fermeture des séries.",
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Inscriptions suivies", value: `${totalRegistrations}`, helper: "Tous tableaux" },
          { label: "Pointages saisis", value: `${totalCheckins}`, helper: "Présences confirmées" },
          { label: "Liste d'attente", value: `${totalWaitlist}`, helper: "À arbitrer" },
          { label: "À relancer", value: `${toFollowUp}`, helper: "Confirmation manquante" },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Occupation des tableaux</h2>
          <p className="text-sm text-muted-foreground">Synthèse des séries à surveiller en priorité.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Tableau</th>
                <th className="py-2 pr-3 font-medium">Catégorie</th>
                <th className="py-2 pr-3 font-medium">Inscrits</th>
                <th className="py-2 pr-3 font-medium">Liste d'attente</th>
                <th className="py-2 font-medium">Pointages</th>
              </tr>
            </thead>
            <tbody>
              {registrationsByTable.map((table) => (
                <tr key={table.table} className="border-b last:border-0">
                  <td className="py-3 pr-3 font-semibold text-foreground">{table.table}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{table.category}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{table.registrations}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{table.waitlist}</td>
                  <td className="py-3 text-muted-foreground">{table.checkins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold">Derniers dossiers joueurs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Joueur</th>
                <th className="py-2 pr-3 font-medium">Club</th>
                <th className="py-2 pr-3 font-medium">Licence</th>
                <th className="py-2 pr-3 font-medium">Classement</th>
                <th className="py-2 pr-3 font-medium">Tableau</th>
                <th className="py-2 pr-3 font-medium">Paiement</th>
                <th className="py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {adminPlayers.map((player) => (
                <tr key={player.licence} className="border-b last:border-0">
                  <td className="py-3 pr-3 text-foreground">{player.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.club}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.licence}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.ranking}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.table}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{player.payment}</td>
                  <td className="py-3 text-muted-foreground">
                    <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {player.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </TournamentAdminPage>
  );
}
