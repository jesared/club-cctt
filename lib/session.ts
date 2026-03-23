import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (!isAdminRole((session.user as any)?.role)) {
    redirect("/");
  }

  return session;
}
