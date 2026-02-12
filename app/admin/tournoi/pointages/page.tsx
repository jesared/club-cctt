import { requireAdminSession, TournamentAdminPage } from "../_components";
import { adminPlayers, tournamentTables } from "../data";

export default async function AdminTournoiPointagesPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Pointages"
      description="Pilotage des arrivées joueurs selon l'horaire réel des tableaux du tournoi."
      activeHref="/admin/tournoi/pointages"
      items={[
        "Ordre de passage par horaire (4, 5 et 6 avril).",
        "Liste des joueurs encore non pointés.",
        "Aide au lancement des tableaux sans retard.",
      ]}
    >
      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Créneaux à ouvrir aujourd'hui</h2>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tournamentTables.slice(0, 6).map((table) => (
            <li key={`${table.date}-${table.table}`} className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-500">{table.date}</p>
              <p className="font-semibold text-gray-900">Tableau {table.table}</p>
              <p className="text-sm text-gray-700">{table.time} · {table.category}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Joueurs à pointer</h2>
        <ul className="space-y-2">
          {adminPlayers
            .filter((player) => player.status !== "Confirmée")
            .map((player) => (
              <li key={player.licence} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                <span className="font-medium">{player.name}</span> · {player.club} · Tableau {player.table} · {player.status}
              </li>
            ))}
        </ul>
      </section>
    </TournamentAdminPage>
  );
}
