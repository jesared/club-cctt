import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  RegistrationEventStatus,
  RegistrationSource,
  RegistrationStatus,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getCurrentTournament, getTournamentTables } from "../data";
import { AddPlayerForm } from "./add-player-form";

type PageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
    edit?: string;
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
    !tournamentId ||
    !licence ||
    !nom ||
    !prenom ||
    !pointsValue ||
    !club ||
    !contactEmail ||
    !contactPhone ||
    selectedEvents.length === 0
  ) {
    redirect(
      "/admin/tournoi/ajout-player?error=Veuillez+remplir+les+champs+obligatoires",
    );
  }

  const points = Number.parseInt(pointsValue, 10);

  if (Number.isNaN(points) || points < 0) {
    redirect("/admin/tournoi/ajout-player?error=Classement+invalide");
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/admin/tournoi/ajout-player?error=Session+invalide");
  }

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
    redirect(
      "/admin/tournoi/ajout-player?error=Tableaux+invalides+ou+indisponibles",
    );
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
    redirect(
      `/admin/tournoi/ajout-player?error=Le+classement+ne+permet+pas+les+tableaux+${tables}`,
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const existingPlayer = await tx.player.findUnique({
          where: { licence },
          select: { id: true },
        });

        const playerRefId =
          existingPlayer?.id ??
          (
            await tx.player.create({
              data: {
                licence,
                nom,
                prenom,
                points,
                club,
                ownerId: session.user.id,
              },
              select: { id: true },
            })
          ).id;

        const maxPlayer = await tx.tournamentRegistration.aggregate({
          where: { tournamentId },
          _max: { playerId: true },
        });

        await tx.tournamentRegistration.create({
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
      },
      { isolationLevel: "Serializable" },
    );
  } catch {
    redirect(
      "/admin/tournoi/ajout-player?error=Ce+joueur+est+d%C3%A9j%C3%A0+inscrit+sur+ce+tournoi",
    );
  }

  revalidatePath("/admin/tournoi/inscriptions");
  revalidatePath("/admin/tournoi/joueurs");
  redirect(
    "/admin/tournoi/ajout-player?success=Joueur+ajout%C3%A9+avec+succ%C3%A8s",
  );
}

async function updatePlayerRegistration(formData: FormData) {
  "use server";

  await requireAdminSession();

  const tournamentId = String(formData.get("tournamentId") ?? "");
  const registrationId = String(formData.get("registrationId") ?? "").trim();
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
    !tournamentId ||
    !registrationId ||
    !licence ||
    !nom ||
    !prenom ||
    !pointsValue ||
    !club ||
    !contactEmail ||
    !contactPhone ||
    selectedEvents.length === 0
  ) {
    redirect(
      `/admin/tournoi/ajout-player?edit=${registrationId}&error=Veuillez+remplir+les+champs+obligatoires`,
    );
  }

  const points = Number.parseInt(pointsValue, 10);

  if (Number.isNaN(points) || points < 0) {
    redirect(
      `/admin/tournoi/ajout-player?edit=${registrationId}&error=Classement+invalide`,
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      `/admin/tournoi/ajout-player?edit=${registrationId}&error=Session+invalide`,
    );
  }

  const registration = await prisma.tournamentRegistration.findUnique({
    where: { id: registrationId },
    include: {
      player: {
        select: { id: true, licence: true },
      },
    },
  });

  if (!registration || registration.tournamentId !== tournamentId) {
    redirect(
      `/admin/tournoi/ajout-player?edit=${registrationId}&error=Inscription+introuvable`,
    );
  }

  if (licence !== registration.player.licence) {
    const existingPlayer = await prisma.player.findUnique({
      where: { licence },
      select: { id: true },
    });

    if (existingPlayer && existingPlayer.id !== registration.player.id) {
      redirect(
        `/admin/tournoi/ajout-player?edit=${registrationId}&error=Cette+licence+est+d%C3%A9j%C3%A0+utilis%C3%A9e`,
      );
    }
  }

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
    redirect(
      `/admin/tournoi/ajout-player?edit=${registrationId}&error=Tableaux+invalides+ou+indisponibles`,
    );
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
    redirect(
      `/admin/tournoi/ajout-player?edit=${registrationId}&error=Le+classement+ne+permet+pas+les+tableaux+${tables}`,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.player.update({
      where: { id: registration.player.id },
      data: {
        licence,
        nom,
        prenom,
        points,
        club,
      },
    });

    await tx.tournamentRegistration.update({
      where: { id: registrationId },
      data: {
        licenseNumber: licence,
        clubName: club,
        contactEmail,
        contactPhone,
        notes,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    await tx.tournamentRegistrationEvent.deleteMany({
      where: { registrationId },
    });

    await tx.tournamentRegistrationEvent.createMany({
      data: selectedEvents.map((eventId) => ({
        registrationId,
        eventId,
        status: RegistrationEventStatus.REGISTERED,
      })),
    });
  });

  revalidatePath("/admin/tournoi/inscriptions");
  revalidatePath("/admin/tournoi/joueurs");
  redirect(
    `/admin/tournoi/ajout-player?edit=${registrationId}&success=Joueur+mis+%C3%A0+jour+avec+succ%C3%A8s`,
  );
}

export default async function AdminTournoiAjoutPlayerPage({
  searchParams,
}: PageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const tournament = await getCurrentTournament();
  const tournamentTables = tournament
    ? await getTournamentTables(tournament.id)
    : [];
  const editId = params.edit?.trim();
  const editRegistration = editId
    ? await prisma.tournamentRegistration.findUnique({
        where: { id: editId },
        include: {
          player: true,
          registrationEvents: { select: { eventId: true } },
        },
      })
    : null;
  const initialData =
    editRegistration && tournament && editRegistration.tournamentId === tournament.id
      ? {
          registrationId: editRegistration.id,
          nom: editRegistration.player.nom,
          prenom: editRegistration.player.prenom,
          licence: editRegistration.player.licence,
          points: editRegistration.player.points?.toString() ?? "",
          club: editRegistration.player.club ?? "",
          contactEmail: editRegistration.contactEmail ?? "",
          contactPhone: editRegistration.contactPhone ?? "",
          notes: editRegistration.notes ?? "",
          eventIds: editRegistration.registrationEvents.map((event) => event.eventId),
        }
      : undefined;
  const editMode = Boolean(initialData);
  const displayError =
    params.error ??
    (editId && !editMode ? "Inscription introuvable ou tournoi inactif." : "");

  return (
    <TournamentAdminPage
      title={editMode ? "Modifier un joueur" : "Ajouter un joueur"}
      description={
        editMode
          ? "Mettez à jour le profil joueur et les tableaux sélectionnés tant que le tournoi n'a pas démarré."
          : "Formulaire d&apos;inscription sur place avec création immédiate du dossier joueur dans le tournoi courant."
      }
    >
      {params.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {params.success}
        </p>
      ) : null}
      {displayError ? (
        <p className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
          {displayError}
        </p>
      ) : null}

      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {editMode ? "Formulaire de modification joueur" : "Formulaire d&apos;ajout joueur"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Tous les champs marqués d&apos;un * sont obligatoires. Le joueur sera
            inscrit en statut confirmé.
          </p>
        </div>

        {tournament ? (
          <AddPlayerForm
            tournamentId={tournament.id}
            tournamentTables={tournamentTables}
            action={editMode ? updatePlayerRegistration : createPlayerRegistration}
            initialData={initialData}
            submitLabel={editMode ? "Mettre à jour le joueur" : undefined}
          />
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Aucun tournoi actif n&apos;a été trouvé. Créez d&apos;abord un tournoi avant
            d&apos;ajouter un joueur.
          </p>
        )}
      </section>
    </TournamentAdminPage>
  );
}




