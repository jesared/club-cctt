import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { createTransport } from "nodemailer";

import { renderEmailTemplate } from "@/lib/email-template";
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
const canonicalSiteURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://cctt.fr";
const emailServer =
  process.env.EMAIL_SERVER ??
  process.env.GOOGLE_EMAIL_SERVER ??
  process.env.GOOGLE_SMTP_SERVER;
const emailFrom =
  process.env.EMAIL_FROM ??
  process.env.GOOGLE_EMAIL_FROM ??
  process.env.GOOGLE_SMTP_FROM;

function parseList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getHostname(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`)
      .hostname;
  } catch {
    return undefined;
  }
}

const trustedOrigins = Array.from(
  new Set([
    "https://cctt.fr",
    "https://www.cctt.fr",
    "https://club.cctt.fr",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ...parseList(
      process.env.BETTER_AUTH_TRUSTED_ORIGINS ??
        process.env.AUTH_TRUSTED_ORIGINS,
    ),
  ].filter((origin): origin is string => Boolean(origin))),
);

const allowedHosts = Array.from(
  new Set([
    "cctt.fr",
    "www.cctt.fr",
    "club.cctt.fr",
    "*.vercel.app",
    getHostname(canonicalSiteURL),
    getHostname(process.env.NEXT_PUBLIC_SITE_URL),
    getHostname(process.env.VERCEL_URL),
    getHostname(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    ...trustedOrigins.map(getHostname),
  ].filter((host): host is string => Boolean(host))),
);

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
    text: `Bonjour,\n\nVoici votre lien de connexion pour ${appName} :\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n`,
    html: renderEmailTemplate({
      eyebrow: "Connexion sécurisée",
      title: `Connexion à ${appName}`,
      intro: "Bonjour,",
      body: "Votre lien de connexion sécurisé est prêt. Il vous permet d'accéder à votre espace club.",
      cta: {
        label: "Se connecter",
        href: url,
      },
      infoTitle: "Détails de la demande",
      infoItems: [
        { label: "Site", value: host },
        { label: "Lien de secours", value: url },
      ],
      note: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez simplement ignorer cet email.",
    }),
  });

  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length > 0) {
    throw new Error(`Email(s) failed: ${failed.join(", ")}`);
  }
}

export const auth = betterAuth({
  appName,
  baseURL: {
    allowedHosts,
    fallback: canonicalSiteURL,
    protocol: canonicalSiteURL.startsWith("http://") ? "http" : "https",
  },
  trustedOrigins,
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
