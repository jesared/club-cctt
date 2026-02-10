import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
      // si le user vient d'être créé par Google
      const existing = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!existing) return true;

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
