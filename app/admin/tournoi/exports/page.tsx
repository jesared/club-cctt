import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiExportsPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Exports"
      description="Exports de données utiles à l'organisation, à la caisse et au juge-arbitre."
      activeHref="/admin/tournoi/exports"
      items={[
        "Export CSV des inscriptions.",
        "Export des paiements pour la comptabilité.",
        "Export des pointages pour le lancement des tableaux.",
      ]}
    />
  );
}
