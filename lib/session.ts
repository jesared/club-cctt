import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentSession(request?: Request) {
  return auth.api.getSession({
    headers: request?.headers ?? (await headers()),
  });
}

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/user?forbidden=admin");
  }

  return session;
}
