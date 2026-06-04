import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { createTransport } from "nodemailer";

import { prisma } from "@/lib/prisma";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ??
  process.env.AUTH_GOOGLE_ID ??
  process.env.GOOGLE_ID;

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ??
  process.env.AUTH_GOOGLE_SECRET ??
  process.env.GOOGLE_SECRET;

const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET;

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "CCTT";
const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
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
    "[auth] Missing BETTER_AUTH_SECRET (or AUTH_SECRET/NEXTAUTH_SECRET). Auth callbacks may fail.",
  );
}

if (!emailServer || !emailFrom) {
  console.warn(
    "[auth] Missing EMAIL_SERVER/EMAIL_FROM for magic link emails. Magic link sign-in will fail until configured.",
  );
}

async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  if (!emailServer || !emailFrom) {
    throw new Error("Magic link email provider is not configured.");
  }

  const { host } = new URL(url);
  const transport = createTransport(emailServer);

  const result = await transport.sendMail({
    to: email,
    from: emailFrom,
    subject: `Votre lien de connexion ${appName}`,
    text: `Bonjour,\n\nVoici votre lien de connexion pour ${appName} :\n${url}\n\nSi vous n'etes pas a l'origine de cette demande, ignorez cet email.\n`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;">
        <h2 style="margin:0 0 12px;">Connexion a ${appName}</h2>
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
          Demande effectuée pour <strong>${host}</strong>. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.
        </p>
      </div>
    `,
  });

  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length > 0) {
    throw new Error(`Email(s) failed: ${failed.join(", ")}`);
  }
}

export const auth = betterAuth({
  appName,
  ...(baseURL ? { baseURL } : {}),
  ...(authSecret ? { secret: authSecret } : {}),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: ["USER", "CLUB", "BUREAU", "ENTRAINEUR", "ADMIN"],
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {},
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ email, url });
      },
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
