import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicMenuVisibility,
  updatePublicMenuVisibility,
} from "@/lib/menu-settings";
import { requireAdminSession } from "@/lib/session";

async function updateMenuSettings(formData: FormData) {
  "use server";

  await requireAdminSession();

  const showTournamentMenu = formData.get("tournoi") === "on";
  await updatePublicMenuVisibility("tournoi", showTournamentMenu);

  revalidatePath("/", "layout");
  revalidatePath("/admin/menu");
}

export default async function AdminMenuPage() {
  await requireAdminSession();

  const menuVisibility = await getPublicMenuVisibility();

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Menus</h1>
        <p className="text-sm text-muted-foreground">
          Gérez l&apos;affichage des menus publics du site.
        </p>
      </header>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Menu public</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateMenuSettings} className="space-y-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition hover:bg-muted/40">
              <input
                type="checkbox"
                name="tournoi"
                defaultChecked={menuVisibility.tournoi}
                className="mt-1 h-4 w-4 cursor-pointer"
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">
                  Afficher le menu Tournoi
                </span>
                <span className="block text-sm text-muted-foreground">
                  Quand cette option est désactivée, le menu Tournoi est masqué
                  dans la navigation publique et le footer. Les pages restent
                  accessibles par lien direct.
                </span>
              </span>
            </label>

            <Button type="submit">Enregistrer</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
