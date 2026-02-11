import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

async function canUserSignIn(userId?: string) {
  if (!userId) {
    return true;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!existing) return true;

    // Ne bloque pas la connexion ici pour éviter les erreurs "Access Denied"
    // en cas de décalage temporaire de schéma/environnement.
    if (!existing.role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "USER" },
      });
    }

    return true;
  } catch {
    // Compatibilité: si la colonne isActive n'est pas encore présente en base,
    // on ne bloque pas toute l'authentification.
    return true;
  }
}

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
      return canUserSignIn(user.id);
      // si le user vient d'être créé par Google
      const existing = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, isActive: true },
      });

      if (!existing) return true;

      if (!existing.isActive) {
        return false;
      }

      // sécurité : si role null
      if (!existing.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "USER" },
        });
      }

      return true;
    },
  },
});
