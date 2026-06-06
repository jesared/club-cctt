"use client";

import Link from "next/link";

import TrackedLink from "@/components/TrackedLink";

type TournamentActionBarProps = {
  canRegister: boolean;
  registrationLabel: string;
  registrationHref: string;
  registrationCtaLabel: string;
  hasUserRegistration: boolean;
};

export default function TournamentActionBar({
  canRegister,
  registrationLabel,
  registrationHref,
  registrationCtaLabel,
  hasUserRegistration,
}: TournamentActionBarProps) {
  return (
    <div className="inline-grid w-full max-w-full grid-cols-1 gap-2 rounded-xl border border-border/70 bg-background/70 p-1.5 shadow-sm shadow-black/5 md:w-fit md:grid-cols-[max-content_max-content_max-content]">
      {canRegister ? (
        <TrackedLink
          kpiPage="tournoi"
          kpiLabel="cta-inscription"
          href={registrationHref}
          className="inline-flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:opacity-90 focus-ring"
        >
          {registrationCtaLabel}
        </TrackedLink>
      ) : (
        <span className="inline-flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-lg bg-muted px-4 text-sm font-semibold text-muted-foreground">
          {registrationLabel}
        </span>
      )}
      <Link
        href="/tournoi/reglement"
        className="inline-flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#FF7A00] px-4 text-sm font-semibold text-[#FF7A00] transition hover:bg-[#FF7A00]/10 focus-ring"
      >
        Consulter le règlement
      </Link>
      {hasUserRegistration ? (
        <Link
          href="/user/inscriptions"
          className="inline-flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-accent/40 focus-ring"
        >
          Voir mes inscriptions
        </Link>
      ) : null}
    </div>
  );
}
