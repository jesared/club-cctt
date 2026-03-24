import { TournamentAdminPage, requireAdminSession } from "../../_components";
import { TournamentEditor } from "../tournament-editor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TournamentEditionPage({ params }: PageProps) {
  await requireAdminSession();
  const { id } = await params;

  return (
    <TournamentAdminPage
      title="Edition du tournoi"
      description="Modifiez le tournoi et ses tableaux tant qu'il n'a pas demarre.">
      <TournamentEditor tournamentId={id} />
    </TournamentAdminPage>
  );
}

