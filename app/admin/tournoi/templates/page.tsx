import { redirect } from "next/navigation";

export default function DeprecatedTournamentSetupPage() {
  redirect("/admin/tournoi/nouveau");
}
