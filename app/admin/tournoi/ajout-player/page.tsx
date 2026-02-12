import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationSource, RegistrationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getCurrentTournament, getTournamentTables } from "../data";
import { AddPlayerForm } from "./add-player-form";

type PageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

async function createPlayerRegistration(formData: FormData) {
  "use server";

  await requireAdminSession();

  const tournamentId = String(formData.get("tournamentId") ?? "");
  const licence = String(formData.get("licence") ?? "").trim();
  const nom = String(formData.get("nom") ?? "").trim();
  const prenom = String(formData.get("prenom") ?? "").trim();
  const pointsValue = String(formData.get("points") ?? "").trim();
  const club = String(formData.get("club") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const selectedEvents = formData
    .getAll("eventIds")
    .map((eventId) => String(eventId).trim())
    .filter(Boolean);

  if (
    !tournamentId
    || !licence
    || !nom
    || !prenom
    || !pointsValue
    || !club
    || !contactEmail
    || !contactPhone
    || selectedEvents.length === 0
  ) {
    redirect("/admin/tournoi/ajout-player?error=Veuillez+remplir+les+champs+obligatoires");
  }

  const points = Number.parseInt(pointsValue, 10);

  if (Number.isNaN(points) || points < 0) {
    redirect("/admin/tournoi/ajout-player?error=Classement+invalide");
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/tournoi/ajout-player?error=Session+invalide");
  }

  const [existingPlayer, maxPlayer] = await Promise.all([
    prisma.player.findUnique({
      where: { licence },
      select: { id: true },
    }),
    prisma.tournamentRegistration.aggregate({
      where: { tournamentId },
      _max: { playerId: true },
    }),
  ]);

  const selectedTournamentEvents = await prisma.tournamentEvent.findMany({
    where: {
      tournamentId,
      id: {
        in: selectedEvents,
      },
    },
    select: {
      code: true,
      minPoints: true,
      maxPoints: true,
    },
  });

  if (selectedTournamentEvents.length !== selectedEvents.length) {
    redirect("/admin/tournoi/ajout-player?error=Tableaux+invalides+ou+indisponibles");
  }

  const ineligibleTables = selectedTournamentEvents
    .filter((event) => {
      if (event.minPoints !== null && points < event.minPoints) {
        return true;
      }

      if (event.maxPoints !== null && points > event.maxPoints) {
        return true;
      }

      return false;
    })
    .map((event) => event.code);

  if (ineligibleTables.length > 0) {
    const tables = encodeURIComponent(ineligibleTables.join(", "));
    redirect(`/admin/tournoi/ajout-player?error=Le+classement+ne+permet+pas+les+tableaux+${tables}`);
  }

  const playerRefId = existingPlayer?.id ?? (await prisma.player.create({
    data: {
      licence,
      nom,
      prenom,
      points,
      club,
      ownerId: session.user.id,
    },
    select: { id: true },
  })).id;

  try {
    await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        playerId: (maxPlayer._max.playerId ?? 0) + 1,
        playerRefId,
        userId: session.user.id,
        licenseNumber: licence,
        clubName: club,
        contactEmail,
        contactPhone,
        notes,
        status: RegistrationStatus.CONFIRMED,
        source: RegistrationSource.ADMIN,
        registrationEvents: {
          create: selectedEvents.map((eventId) => ({ eventId })),
        },
      },
    });
  } catch {
    redirect("/admin/tournoi/ajout-player?error=Ce+joueur+est+d%C3%A9j%C3%A0+inscrit+sur+ce+tournoi");
  }

  revalidatePath("/admin/tournoi/inscriptions");
  revalidatePath("/admin/tournoi/joueurs");
  redirect("/admin/tournoi/ajout-player?success=Joueur+ajout%C3%A9+avec+succ%C3%A8s");
}

export default async function AdminTournoiAjoutPlayerPage({ searchParams }: PageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const tournament = await getCurrentTournament();
  const tournamentTables = tournament ? await getTournamentTables(tournament.id) : [];

  return (
    <TournamentAdminPage
      title="Ajouter un joueur"
      description="Formulaire d'inscription sur place avec création immédiate du dossier joueur dans le tournoi courant."
      activeHref="/admin/tournoi/ajout-player"
      items={[
        "Saisie identité, licence, club et classement.",
        "Sélection d'un ou plusieurs tableaux disponibles.",
        "Création directe d'une inscription confirmée source ADMIN.",
      ]}
    >
      {params.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {params.success}
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <section className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Formulaire d'ajout joueur</h2>
          <p className="text-sm text-gray-600">
            Tous les champs marqués d'un * sont obligatoires. Le joueur sera inscrit en statut confirmé.
          </p>
        </div>

        {tournament ? (
          <AddPlayerForm
            tournamentId={tournament.id}
            tournamentTables={tournamentTables}
            action={createPlayerRegistration}
          />
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Aucun tournoi actif n'a été trouvé. Créez d'abord un tournoi avant d'ajouter un joueur.
          </p>
        )}
      </section>
    </TournamentAdminPage>
  );
}
