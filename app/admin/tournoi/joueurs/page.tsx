import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getAdminPlayers, getCurrentTournament } from "../data";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerDirectory, type DirectoryPlayer } from "./player-directory";

export default async function AdminTournoiJoueursPage() {
  await requireAdminSession();

  const tournament = await getCurrentTournament();
  const rows = tournament ? await getAdminPlayers(tournament.id) : [];
  const players: DirectoryPlayer[] = rows.map(({
    id, name, club, licence, ranking, dossard, table, status, statusDetail,
    payment, fullyRefunded, paymentGroupKey,
  }) => ({
    id, name, club, licence, ranking, dossard, table, status, statusDetail,
    payment, fullyRefunded, paymentGroupKey,
  }));

  return (
    <TournamentAdminPage title="Joueurs" description="" showHeader={false}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          {tournament && <p className="text-sm font-medium text-muted-foreground">{tournament.name}</p>}
          <h1 className="text-3xl font-bold tracking-tight">Joueurs</h1>
        </div>
        {tournament && (
          <Button asChild className="h-10">
            <Link href="/admin/tournoi/ajout-player">
              <Plus aria-hidden="true" className="size-4" /> Ajouter un joueur
            </Link>
          </Button>
        )}
      </header>
      {tournament ? (
        <PlayerDirectory players={players} />
      ) : (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Aucun tournoi actif.
        </p>
      )}
    </TournamentAdminPage>
  );
}



