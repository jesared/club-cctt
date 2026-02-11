import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

function getFirstNonEmpty(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}

function requireAuthEnv(name: string, value: string | undefined, acceptedNames: string[]) {
  if (value) return value;

  throw new Error(
    `[auth] Missing required ${name}. Define one of: ${acceptedNames.join(", ")}. Refusing to start to avoid runtime /api/auth/error?error=Configuration failures.`
  );
}

const googleClientId = requireAuthEnv(
  "Google OAuth client id",
  getFirstNonEmpty(
    process.env.GOOGLE_CLIENT_ID,
    process.env.AUTH_GOOGLE_ID,
    process.env.GOOGLE_ID
  ),
  ["GOOGLE_CLIENT_ID", "AUTH_GOOGLE_ID", "GOOGLE_ID"]
);

const googleClientSecret = requireAuthEnv(
  "Google OAuth client secret",
  getFirstNonEmpty(
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.AUTH_GOOGLE_SECRET,
    process.env.GOOGLE_SECRET
  ),
  ["GOOGLE_CLIENT_SECRET", "AUTH_GOOGLE_SECRET", "GOOGLE_SECRET"]
);

const authSecret = requireAuthEnv(
  "NextAuth secret",
  getFirstNonEmpty(process.env.AUTH_SECRET, process.env.NEXTAUTH_SECRET),
  ["AUTH_SECRET", "NEXTAUTH_SECRET"]
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // NOTE: cast avoids TypeScript conflicts when multiple @auth/core copies are present
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: authSecret,
  trustHost: true,

  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    /**
     * 🔴 IMPORTANT
     * Injecte les infos utilisateur (id + role) dans la session
     * sinon NextJS ne sait pas qui est admin
     */
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).role = user.role;
      }
      return session;
    },

    /**
     * Création du compte
     * → on force un rôle par défaut
     */
    async signIn({ user }) {
      // Selon le provider et l'étape du flow OAuth,
      // user.id peut être absent au moment du callback.
      const existing = user.id
        ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true },
          })
        : user.email
        ? await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true },
          })
        : null;

      if (!existing) return true;


      // sécurité : si role null
      if (!existing.role) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: "USER" },
        });
      }

      return true;
    },
  },
});
