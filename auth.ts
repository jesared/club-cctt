import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // NOTE: cast avoids TypeScript conflicts when multiple @auth/core copies are present
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      if (session.user) {
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
            select: { id: true, role: true, isActive: true },
          })
        : user.email
        ? await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, isActive: true },
          })
        : null;

      if (!existing) return true;

      if (!existing.isActive) {
        return false;
      }

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
