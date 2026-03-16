import { redirect } from "next/navigation";

export default function LegacyMesInscriptionsRedirectPage() {
  redirect("/user/inscriptions");
}
