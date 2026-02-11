import { requireAdminSession, TournamentAdminPage } from "./_components";

export default async function AdminTournoiPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Dashboard tournoi"
      description="Vue d'ensemble du tournoi avec les actions principales pour les bénévoles et les administrateurs."
      activeHref="/admin/tournoi"
      items={[
        "Suivre les inscriptions validées et en attente.",
        "Voir les paiements à encaisser rapidement.",
        "Repérer les joueurs non pointés avant les tableaux.",
      ]}
    />
  );
}
