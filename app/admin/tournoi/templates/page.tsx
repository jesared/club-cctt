import { TournamentAdminPage, requireAdminSession } from "../_components";
import { TemplatesClient } from "./templates-client";

export default async function TournamentTemplatesPage() {
  await requireAdminSession();

  return (
    <TournamentAdminPage
      title="Templates"
      description="Gérez le template tournoi et les templates de tableaux.">
      <TemplatesClient />
    </TournamentAdminPage>
  );
}




