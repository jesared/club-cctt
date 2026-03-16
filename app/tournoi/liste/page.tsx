import { redirect } from "next/navigation";

export default function LegacyListeRedirectPage() {
  redirect("/tournoi/liste-inscrits");
}
