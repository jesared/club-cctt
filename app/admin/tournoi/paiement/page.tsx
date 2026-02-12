import { requireAdminSession, TournamentAdminPage } from "../_components";
import { adminPlayers, tournamentTables } from "../data";

const onSitePlayers = adminPlayers.filter((player) => player.payment === "Sur place");
const earlyPlayers = adminPlayers.filter((player) => player.payment === "Anticipé");

const paymentMethods = [
  { method: "Anticipé", count: earlyPlayers.length, amount: "33 €", trend: "Paiements validés en ligne" },
  { method: "Sur place", count: onSitePlayers.length, amount: "28 €", trend: "À encaisser au pointage" },
];

export default async function AdminTournoiPaiementPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Contrôle des tarifs anticipés / sur place selon les tableaux officiels du tournoi."
      activeHref="/admin/tournoi/paiement"
      items={[
        "Référence unique des tarifs par tableau (A à P).",
        "Suivi des joueurs à encaisser au guichet le jour J.",
        "Préparation d'une caisse lisible par créneau de compétition.",
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs anticipés</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{earlyPlayers.length}</p>
          <p className="mt-1 text-sm text-gray-600">Paiement déjà confirmé</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Joueurs sur place</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{onSitePlayers.length}</p>
          <p className="mt-1 text-sm text-gray-600">À encaisser avant lancement</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux à 8€/9€</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tournamentTables.filter((table) => table.earlyPayment === "8€").length}
          </p>
          <p className="mt-1 text-sm text-gray-600">Tarif standard</p>
        </article>
        <article className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tableaux premium</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tournamentTables.filter((table) => table.earlyPayment !== "8€").length}
          </p>
          <p className="mt-1 text-sm text-gray-600">I (9€/10€) et P (10€/11€)</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Tarifs officiels par tableau</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-3 font-medium">Tableau</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Horaire</th>
                  <th className="py-2 pr-3 font-medium">Anticipé</th>
                  <th className="py-2 font-medium">Sur place</th>
                </tr>
              </thead>
              <tbody>
                {tournamentTables.map((table) => (
                  <tr key={table.table} className="border-b last:border-0">
                    <td className="py-3 pr-3 font-semibold text-gray-900">{table.table}</td>
                    <td className="py-3 pr-3 text-gray-700">{table.date}</td>
                    <td className="py-3 pr-3 text-gray-700">{table.time}</td>
                    <td className="py-3 pr-3 text-gray-700">{table.earlyPayment}</td>
                    <td className="py-3 text-gray-700">{table.onsitePayment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Modes de règlement</h2>
          <ul className="space-y-3">
            {paymentMethods.map((entry) => (
              <li key={entry.method} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{entry.method}</p>
                  <p className="text-sm font-semibold text-gray-700">{entry.amount}</p>
                </div>
                <p className="text-xs text-gray-500">{entry.count} joueurs</p>
                <p className="mt-1 text-xs text-red-600">{entry.trend}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </TournamentAdminPage>
  );
}
