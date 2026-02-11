import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiPointagesPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Pointages"
      description="Espace de check-in pour pointer rapidement les joueurs à leur arrivée."
      activeHref="/admin/tournoi/pointages"
      items={[
        "Recherche rapide par nom, prénom ou numéro de licence.",
        "Pointage manuel par joueur et par tableau.",
        "Vue des absents avant le lancement des matchs.",
      ]}
    />
  );
}
