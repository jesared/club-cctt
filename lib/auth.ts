import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ??
  process.env.AUTH_GOOGLE_ID ??
  process.env.GOOGLE_ID;

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ??
  process.env.AUTH_GOOGLE_SECRET ??
  process.env.GOOGLE_SECRET;

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error(
    "[auth] Missing Google OAuth credentials. Set AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).",
  );
}

if (!authSecret) {
  console.error(
    "[auth] Missing AUTH_SECRET (or NEXTAUTH_SECRET). OAuth callbacks may fail.",
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: authSecret,

  providers: [
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    /**
     * Injecte id + role dans la session
     */
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },

    /**
     * Lors du login
     */
    async signIn({ user }) {
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

      if (!existing.role) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: "USER" },
        });
      }

      return true;
    },
  },
};

export default NextAuth(authOptions);
