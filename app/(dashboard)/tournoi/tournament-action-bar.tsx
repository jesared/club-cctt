"use client";

import Link from "next/link";

import TrackedLink from "@/components/TrackedLink";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

type TournamentActionBarProps = {
  canRegister: boolean;
  registrationLabel: string;
  registrationHref: string;
  registrationCtaLabel: string;
  hasUserRegistration: boolean;
  showRegistrationCta?: boolean;
};

export default function TournamentActionBar({
  canRegister,
  registrationLabel,
  registrationHref,
  registrationCtaLabel,
  hasUserRegistration,
  showRegistrationCta = canRegister,
}: TournamentActionBarProps) {
  const primaryAction = showRegistrationCta ? (
    <TrackedLink
      kpiPage="tournoi"
      kpiLabel="cta-inscription"
      href={registrationHref}
      className="inline-flex h-11 min-w-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-none transition hover:bg-primary/90 focus-ring md:min-w-[12rem]"
    >
      {registrationCtaLabel}
    </TrackedLink>
  ) : (
    <span className="inline-flex h-11 min-w-0 items-center justify-center rounded-xl bg-muted px-4 text-sm font-semibold text-muted-foreground md:min-w-[12rem]">
      {registrationLabel}
    </span>
  );

  const actionClassName =
    "inline-flex h-11 min-w-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-ring md:min-w-[12rem]";

  return (
    <>
      <div className="flex w-full flex-col gap-2 md:hidden">
        {primaryAction}
        <Link
          href="/tournoi/reglement"
          className={cn(
            actionClassName,
            "border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/10",
          )}
        >
          Consulter le reglement
        </Link>
        {hasUserRegistration ? (
          <Link
            href="/user/inscriptions"
            className={cn(actionClassName, "hover:bg-accent/40")}
          >
            Voir mes inscriptions
          </Link>
        ) : null}
      </div>

      <ButtonGroup
        aria-label="Actions tournoi"
        className="hidden w-fit min-w-0 bg-transparent p-0 shadow-none md:flex"
      >
        {primaryAction}
        <ButtonGroupSeparator className="mx-px" />
        <Link
          href="/tournoi/reglement"
          className={cn(
            actionClassName,
            "text-[#FF7A00] hover:bg-[#FF7A00]/10",
          )}
        >
          Consulter le reglement
        </Link>
        {hasUserRegistration ? (
          <>
            <ButtonGroupSeparator className="mx-px" />
            <Link
              href="/user/inscriptions"
              className={cn(actionClassName, "hover:bg-accent/40")}
            >
              Voir mes inscriptions
            </Link>
          </>
        ) : null}
      </ButtonGroup>
    </>
  );
}
