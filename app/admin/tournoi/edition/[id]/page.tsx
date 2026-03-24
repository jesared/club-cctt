import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { TournamentEditor } from "../tournament-editor";

type PageProps = {
  params: { id: string };
};

export default async function TournamentEditionPage({ params }: PageProps) {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Edition du tournoi"
      description="Modifiez le tournoi et ses tableaux tant qu'il n'a pas demarre.">
      <TournamentEditor tournamentId={params.id} />
    </TournamentAdminPage>
  );
}

