import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  if ((session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
