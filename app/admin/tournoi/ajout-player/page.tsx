import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiAjoutPlayerPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Ajouter un joueur"
      description="Formulaire de création rapide d'un joueur pour une inscription sur place."
      activeHref="/admin/tournoi/ajout-player"
      items={[
        "Saisie identité, licence et club.",
        "Affectation immédiate aux tableaux souhaités.",
        "Lien direct vers la page Paiements après enregistrement.",
      ]}
    />
  );
}
