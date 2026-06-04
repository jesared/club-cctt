import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";

import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  ...(process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL
    ? {
        baseURL:
          process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
          process.env.NEXT_PUBLIC_SITE_URL,
      }
    : {}),
  plugins: [magicLinkClient(), inferAdditionalFields<typeof auth>()],
});
