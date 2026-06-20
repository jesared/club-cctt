"use client";

import Link from "next/link";

import TrackedLink from "@/components/TrackedLink";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { ctaToneClasses } from "@/lib/cta-theme";

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
    <Button
      asChild
      className="h-11 min-w-0 rounded-xl px-4 font-semibold md:min-w-[12rem]"
    >
      <TrackedLink
        kpiPage="tournoi"
        kpiLabel="cta-inscription"
        href={registrationHref}
      >
        {registrationCtaLabel}
      </TrackedLink>
    </Button>
  ) : (
    <Button
      disabled
      variant="secondary"
      className="h-11 min-w-0 rounded-xl px-4 font-semibold md:min-w-[12rem]"
    >
      {registrationLabel}
    </Button>
  );

  return (
    <>
      <div className="flex w-full flex-col gap-2 md:hidden">
        {primaryAction}
        <Button
          asChild
          variant="outline"
          className={`h-11 min-w-0 rounded-xl px-4 font-semibold md:min-w-[12rem] ${ctaToneClasses.tournament.softBorderButton}`}
        >
          <Link href="/tournoi/reglement">Consulter le reglement</Link>
        </Button>
        {hasUserRegistration ? (
          <Button
            asChild
            variant="ghost"
            className="h-11 min-w-0 rounded-xl px-4 font-semibold md:min-w-[12rem]"
          >
            <Link href="/user/inscriptions">Suivre mes inscriptions</Link>
          </Button>
        ) : null}
      </div>

      <ButtonGroup
        aria-label="Actions tournoi"
        className="hidden w-fit min-w-0 bg-transparent p-0 shadow-none md:flex"
      >
        {primaryAction}
        <ButtonGroupSeparator className="mx-px" />
        <Button
          asChild
          variant="ghost"
          className={`h-11 min-w-0 rounded-xl px-4 font-semibold md:min-w-[12rem] ${ctaToneClasses.tournament.softButton}`}
        >
          <Link href="/tournoi/reglement">Consulter le reglement</Link>
        </Button>
        {hasUserRegistration ? (
          <>
            <ButtonGroupSeparator className="mx-px" />
            <Button
              asChild
              variant="ghost"
              className="h-11 min-w-0 rounded-xl px-4 font-semibold md:min-w-[12rem]"
            >
              <Link href="/user/inscriptions">Suivre mes inscriptions</Link>
            </Button>
          </>
        ) : null}
      </ButtonGroup>
    </>
  );
}
