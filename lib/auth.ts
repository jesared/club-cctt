import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { createTransport } from "nodemailer";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ??
  process.env.AUTH_GOOGLE_ID ??
  process.env.GOOGLE_ID;

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ??
  process.env.AUTH_GOOGLE_SECRET ??
  process.env.GOOGLE_SECRET;

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "CCTT";
const emailServer =
  process.env.EMAIL_SERVER ??
  process.env.GOOGLE_EMAIL_SERVER ??
  process.env.GOOGLE_SMTP_SERVER;
const emailFrom =
  process.env.EMAIL_FROM ??
  process.env.GOOGLE_EMAIL_FROM ??
  process.env.GOOGLE_SMTP_FROM;

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

if (!emailServer || !emailFrom) {
  console.warn(
    "[auth] Missing EMAIL_SERVER/EMAIL_FROM for magic link emails. Email provider disabled.",
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: authSecret,
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
  },

  providers: [
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    }),
    ...(emailServer && emailFrom
      ? [
          EmailProvider({
            server: emailServer,
            from: emailFrom,
            sendVerificationRequest: async ({
              identifier,
              url,
              provider,
            }) => {
              const { host } = new URL(url);
              const transport = createTransport(provider.server);

              const result = await transport.sendMail({
                to: identifier,
                from: provider.from,
                subject: `Votre lien de connexion ${appName}`,
                text: `Bonjour,\n\nVoici votre lien de connexion pour ${appName} :\n${url}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet email.\n`,
                html: `
                  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;">
                    <h2 style="margin:0 0 12px;">Connexion à ${appName}</h2>
                    <p>Bonjour,</p>
                    <p>Voici votre lien de connexion sécurisé :</p>
                    <p style="margin:20px 0;">
                      <a href="${url}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">
                        Se connecter
                      </a>
                    </p>
                    <p style="font-size:12px;color:#555;">
                      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                      <span>${url}</span>
                    </p>
                    <p style="font-size:12px;color:#777;">
                      Demande effectuée pour <strong>${host}</strong>. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.
                    </p>
                  </div>
                `,
              });

              const failed = result.rejected.concat(result.pending).filter(Boolean);
              if (failed.length > 0) {
                throw new Error(`Email(s) failed: ${failed.join(", ")}`);
              }
            },
          }),
        ]
      : []),
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
          data: { role: "USER" as Role },
        });
      }

      return true;
    },
  },
  pages: {
    verifyRequest: "/auth/verify-request",
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
