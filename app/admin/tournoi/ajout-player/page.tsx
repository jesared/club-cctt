import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationSource, RegistrationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, TournamentAdminPage } from "../_components";
import { getCurrentTournament, getTournamentTables } from "../data";

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

  if (!tournamentId || !licence || !nom || !prenom || selectedEvents.length === 0) {
    redirect("/admin/tournoi/ajout-player?error=Veuillez+remplir+les+champs+obligatoires");
  }

  const points = pointsValue ? Number.parseInt(pointsValue, 10) : null;

  if (Number.isNaN(points)) {
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

  const playerRefId = existingPlayer?.id ?? (await prisma.player.create({
    data: {
      licence,
      nom,
      prenom,
      points: points ?? undefined,
      club: club || null,
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
        clubName: club || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        notes: notes || null,
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
          <form action={createPlayerRegistration} className="space-y-6">
            <input type="hidden" name="tournamentId" value={tournament.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Nom *</span>
                <input
                  name="nom"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Prénom *</span>
                <input
                  name="prenom"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Licence *</span>
                <input
                  name="licence"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Classement (points)</span>
                <input
                  name="points"
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Club</span>
                <input
                  name="club"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-gray-700">Email</span>
                <input
                  name="contactEmail"
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span className="font-medium text-gray-700">Téléphone</span>
                <input
                  name="contactPhone"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Tableaux à inscrire *</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tournamentTables.map((table) => (
                  <label
                    key={table.id}
                    className="flex items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm"
                  >
                    <input type="checkbox" name="eventIds" value={table.id} className="mt-0.5" />
                    <span>
                      <span className="block font-semibold text-gray-900">Tableau {table.table}</span>
                      <span className="block text-gray-600">{table.category}</span>
                      <span className="block text-gray-500">Sur place : {table.onsitePayment}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <label className="space-y-1 text-sm block">
              <span className="font-medium text-gray-700">Notes internes</span>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Ajouter le joueur
            </button>
          </form>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Aucun tournoi actif n'a été trouvé. Créez d'abord un tournoi avant d'ajouter un joueur.
          </p>
        )}
      </section>
    </TournamentAdminPage>
  );
}
