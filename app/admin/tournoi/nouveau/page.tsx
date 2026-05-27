import { TournamentAdminPage, requireAdminSession } from "../_components";
import { getTournamentDuplicationSources } from "../data";
import { NewTournamentClient } from "./new-tournament-client";

export default async function NewTournamentPage() {
  await requireAdminSession();

  const sources = await getTournamentDuplicationSources();

  return (
    <TournamentAdminPage
      title="Nouveau tournoi"
      description="Créez une nouvelle édition en dupliquant un tournoi existant."
    >
      <NewTournamentClient
        sources={sources.map((source) => ({
          id: source.id,
          name: source.name,
          slug: source.slug,
          description: source.description,
          venue: source.venue,
          registrationOpenAt: source.registrationOpenAt?.toISOString() ?? null,
          registrationCloseAt: source.registrationCloseAt?.toISOString() ?? null,
          startDate: source.startDate.toISOString(),
          endDate: source.endDate.toISOString(),
          status: source.status,
          eventsCount: source._count.events,
        }))}
      />
    </TournamentAdminPage>
  );
}
