import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

type EnvCandidate = {
  name: string;
  value: string | undefined;
};

function sanitizeEnvValue(value: string | undefined) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const hasDoubleQuotes = trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasSimpleQuotes = trimmed.startsWith("'") && trimmed.endsWith("'");
  if (hasDoubleQuotes || hasSimpleQuotes) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function getFirstDefinedEnv(...candidates: EnvCandidate[]) {
  for (const candidate of candidates) {
    const sanitized = sanitizeEnvValue(candidate.value);
    if (sanitized) {
      return {
        name: candidate.name,
        value: sanitized,
      };
    }
  }

  return undefined;
}

function requireAuthEnv(name: string, acceptedCandidates: EnvCandidate[]) {
  const resolved = getFirstDefinedEnv(...acceptedCandidates);
  if (resolved?.value) return resolved;

  throw new Error(
    `[auth] Missing required ${name}. Define one of: ${acceptedCandidates
      .map((candidate) => candidate.name)
      .join(", ")}. Refusing to start to avoid runtime /api/auth/error?error=Configuration failures.`
  );
}

function getValidatedOriginUrl(value: string | undefined) {
  const sanitized = sanitizeEnvValue(value);
  if (!sanitized) return undefined;

  try {
    const parsed = new URL(sanitized);
    if (parsed.pathname !== "/" && parsed.pathname !== "") {
      console.warn(
        `[auth] ${sanitized} contains a path (${parsed.pathname}) in AUTH_URL/NEXTAUTH_URL. Using origin only: ${parsed.origin}`
      );
    }
    return parsed.origin;
  } catch {
    console.warn(
      `[auth] Invalid AUTH_URL/NEXTAUTH_URL: "${sanitized}". Ignoring it and relying on trusted host headers.`
    );
    return undefined;
  }
}

const authUrl = getValidatedOriginUrl(
  getFirstDefinedEnv(
    { name: "AUTH_URL", value: process.env.AUTH_URL },
    { name: "NEXTAUTH_URL", value: process.env.NEXTAUTH_URL },
    { name: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL }
  )?.value
);

const googleClientId = requireAuthEnv("Google OAuth client id", [
  { name: "GOOGLE_CLIENT_ID", value: process.env.GOOGLE_CLIENT_ID },
  { name: "AUTH_GOOGLE_ID", value: process.env.AUTH_GOOGLE_ID },
  { name: "GOOGLE_ID", value: process.env.GOOGLE_ID },
]);

const googleClientSecret = requireAuthEnv("Google OAuth client secret", [
  { name: "GOOGLE_CLIENT_SECRET", value: process.env.GOOGLE_CLIENT_SECRET },
  { name: "AUTH_GOOGLE_SECRET", value: process.env.AUTH_GOOGLE_SECRET },
  { name: "GOOGLE_SECRET", value: process.env.GOOGLE_SECRET },
]);

const authSecret = requireAuthEnv("NextAuth secret", [
  { name: "AUTH_SECRET", value: process.env.AUTH_SECRET },
  { name: "NEXTAUTH_SECRET", value: process.env.NEXTAUTH_SECRET },
]);

console.info(
  `[auth] Configuration loaded (clientId:${googleClientId.name}, clientSecret:${googleClientSecret.name}, secret:${authSecret.name}${authUrl ? `, url:${authUrl}` : ""})`
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // NOTE: cast avoids TypeScript conflicts when multiple @auth/core copies are present
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: authSecret.value,
  trustHost: true,
  providers: [
    Google({
      clientId: googleClientId.value,
      clientSecret: googleClientSecret.value,
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
