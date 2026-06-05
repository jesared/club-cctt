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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {canRegister ? (
        <TrackedLink
          kpiPage="tournoi"
          kpiLabel="cta-inscription"
          href={registrationHref}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 focus-ring"
        >
          {registrationCtaLabel}
        </TrackedLink>
      ) : (
        <span className="inline-flex h-11 items-center justify-center rounded-md bg-muted px-5 text-sm font-semibold text-muted-foreground">
          {registrationLabel}
        </span>
      )}
      <Link
        href="/tournoi/reglement"
        className="inline-flex h-11 items-center justify-center rounded-md border border-[#FF7A00] px-6 text-sm font-medium text-[#FF7A00] transition hover:bg-[#FF7A00]/10 focus-ring"
      >
        Consulter le règlement
      </Link>
      {hasUserRegistration ? (
        <Link
          href="/user/inscriptions"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition hover:bg-accent/40 focus-ring"
        >
          Voir mes inscriptions
        </Link>
      ) : null}
    </div>
  );
}
