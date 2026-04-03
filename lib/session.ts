import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/user?forbidden=admin");
  }

  return session;
}
