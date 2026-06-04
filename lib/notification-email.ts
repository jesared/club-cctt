import type {
  Notification,
  NotificationAudience,
  Prisma,
  Role,
  User,
} from "@prisma/client";

import { renderEmailTemplate } from "@/lib/email-template";
import { prisma } from "@/lib/prisma";

type NotificationEmailTarget = Pick<User, "email" | "role">;

export type NotificationEmailDelivery = {
  attempted: boolean;
  sent: number;
  failed: number;
  error?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildAudienceWhere(
  audience: NotificationAudience,
  roleScope: Role | null,
): Prisma.UserWhereInput {
  switch (audience) {
    case "ALL_MEMBERS":
      return {};
    case "CLUB_SPACE":
      return {
        role: { in: ["CLUB", "BUREAU", "ENTRAINEUR", "ADMIN"] satisfies Role[] },
      };
    case "BUREAU_SPACE":
      return { role: { in: ["BUREAU", "ADMIN"] satisfies Role[] } };
    case "ENTRAINEUR_SPACE":
      return { role: { in: ["ENTRAINEUR", "ADMIN"] satisfies Role[] } };
    case "ADMIN_ONLY":
      return { role: "ADMIN" };
    case "ROLE":
      return roleScope ? { role: roleScope } : { id: "__no_role_scope__" };
    default:
      return { id: "__unknown_audience__" };
  }
}

function normalizeRecipients(users: NotificationEmailTarget[]) {
  return Array.from(
    new Set(
      users
        .map((user) => user.email.trim().toLowerCase())
        .filter((email) => emailPattern.test(email) && !email.endsWith(".local")),
    ),
  );
}

function buildNotificationUrl(href: string | null) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL ?? "";

  if (!href) {
    return baseUrl ? `${baseUrl.replace(/\/$/, "")}/user/notifications` : "";
  }

  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  return baseUrl ? `${baseUrl.replace(/\/$/, "")}${href}` : href;
}

async function sendResendEmail(input: {
  recipients: string[];
  notification: Pick<Notification, "title" | "content" | "href">;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY est manquant.");
  }

  const from =
    process.env.NOTIFICATION_FROM_EMAIL ??
    process.env.CONTACT_FROM_EMAIL ??
    "CCTT <contact@mail.cctt.fr>";
  const replyTo =
    process.env.NOTIFICATION_REPLY_TO_EMAIL ??
    process.env.CONTACT_TO_EMAIL ??
    "communication@cctt.fr";
  const url = buildNotificationUrl(input.notification.href);
  const text = [
    input.notification.title,
    "",
    input.notification.content,
    url ? ["", `Lien: ${url}`].join("\n") : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderEmailTemplate({
    eyebrow: "Notification club",
    title: input.notification.title,
    body: input.notification.content,
    cta: url
      ? {
          label: "Ouvrir dans l'espace CCTT",
          href: url,
        }
      : undefined,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.recipients,
      reply_to: replyTo,
      subject: `[CCTT] ${input.notification.title}`,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur Resend.");
  }
}

export async function sendNotificationEmail(
  notification: Pick<
    Notification,
    "title" | "content" | "href" | "audience" | "roleScope"
  >,
): Promise<NotificationEmailDelivery> {
  const users = await prisma.user.findMany({
    where: buildAudienceWhere(notification.audience, notification.roleScope),
    select: { email: true, role: true },
  });
  const recipients = normalizeRecipients(users);

  if (recipients.length === 0) {
    return { attempted: true, sent: 0, failed: 0 };
  }

  try {
    await sendResendEmail({ recipients, notification });
    return { attempted: true, sent: recipients.length, failed: 0 };
  } catch (error) {
    return {
      attempted: true,
      sent: 0,
      failed: recipients.length,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de l'envoi email.",
    };
  }
}
