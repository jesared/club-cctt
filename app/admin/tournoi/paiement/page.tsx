import { requireAdminSession, TournamentAdminPage } from "../_components";

export default async function AdminTournoiPaiementPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Paiements"
      description="Suivi des règlements d'inscription et traitement des paiements en attente."
      activeHref="/admin/tournoi/paiement"
      items={[
        "Visualiser les joueurs non réglés ou partiellement réglés.",
        "Marquer un paiement encaissé (espèces, CB, virement, chèque).",
        "Préparer un export de caisse de fin de journée.",
      ]}
    />
  );
}
