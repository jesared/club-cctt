import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiInscriptionsPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Inscriptions"
      description="Liste et suivi des inscriptions pour chaque tableau du tournoi."
      activeHref="/admin/tournoi/inscriptions"
      items={[
        "Filtrer par tableau, club, catégorie et statut.",
        "Valider une inscription et gérer la liste d'attente.",
        "Accéder au détail joueur pour corriger les informations.",
      ]}
    />
  );
}
