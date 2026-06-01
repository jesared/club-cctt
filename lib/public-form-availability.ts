type PublicFormAvailability = {
  isAvailable: boolean;
  message: string;
  missing: string[];
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function hasWebhook(webhookUrl: string | undefined) {
  return hasValue(webhookUrl);
}

function hasResendDelivery(
  resendApiKey: string | undefined,
  recipient: string | undefined,
) {
  return hasValue(resendApiKey) && hasValue(recipient);
}

export function getContactFormAvailability(
  env: NodeJS.ProcessEnv = process.env,
): PublicFormAvailability {
  const hasConfiguredDelivery =
    hasWebhook(env.CONTACT_WEBHOOK_URL) ||
    hasResendDelivery(env.RESEND_API_KEY, env.CONTACT_TO_EMAIL);

  if (hasConfiguredDelivery) {
    return {
      isAvailable: true,
      message: "Le formulaire de contact est configure.",
      missing: [],
    };
  }

  return {
    isAvailable: false,
    message:
      "Le formulaire de contact n'est pas encore disponible sur cet environnement.",
    missing: [
      "CONTACT_WEBHOOK_URL",
      "ou RESEND_API_KEY + CONTACT_TO_EMAIL",
    ],
  };
}

export function getTournamentRegistrationNotificationAvailability(
  env: NodeJS.ProcessEnv = process.env,
): PublicFormAvailability {
  const hasConfiguredDelivery =
    hasWebhook(env.TOURNAMENT_REGISTRATION_WEBHOOK_URL) ||
    hasResendDelivery(
      env.RESEND_API_KEY,
      env.TOURNAMENT_REGISTRATION_TO_EMAIL,
    );

  if (hasConfiguredDelivery) {
    return {
      isAvailable: true,
      message: "Les notifications d'inscription tournoi sont configurees.",
      missing: [],
    };
  }

  return {
    isAvailable: false,
    message:
      "Les inscriptions tournoi sont temporairement fermees sur cet environnement car l'envoi de confirmation n'est pas configure.",
    missing: [
      "TOURNAMENT_REGISTRATION_WEBHOOK_URL",
      "ou RESEND_API_KEY + TOURNAMENT_REGISTRATION_TO_EMAIL",
    ],
  };
}
