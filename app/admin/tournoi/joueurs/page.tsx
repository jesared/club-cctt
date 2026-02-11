import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiJoueursPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Joueurs"
      description="Gestion de la base joueurs du tournoi et accès aux fiches individuelles."
      activeHref="/admin/tournoi/joueurs"
      items={[
        "Lister tous les joueurs importés ou créés manuellement.",
        "Voir les participations par tableau.",
        "Modifier les informations administratives d'une fiche joueur.",
      ]}
    />
  );
}
