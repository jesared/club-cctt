"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import TrackedLink from "@/components/TrackedLink";

type TournamentActionBarProps = {
  canRegister: boolean;
  registrationLabel: string;
  registrationHref: string;
  registrationCtaLabel: string;
  hasUserRegistration: boolean;
};

const getStickyOffset = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 640px)").matches
    ? 92
    : 88;

function ActionButtons({
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

export default function TournamentActionBar(props: TournamentActionBarProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const syncFixedState = () => {
      const row = rowRef.current;
      if (!row) return;

      setIsFixed(row.getBoundingClientRect().top <= getStickyOffset());
    };

    syncFixedState();
    window.addEventListener("scroll", syncFixedState, { passive: true });
    window.addEventListener("resize", syncFixedState);

    return () => {
      window.removeEventListener("scroll", syncFixedState);
      window.removeEventListener("resize", syncFixedState);
    };
  }, []);

  return (
    <>
      <div
        ref={rowRef}
        className={isFixed ? "invisible pointer-events-none" : ""}
        aria-hidden={isFixed}
      >
        <ActionButtons {...props} />
      </div>

      {isMounted && isFixed
        ? createPortal(
            <div className="fixed inset-x-0 top-[5.5rem] z-40 px-4 sm:top-[5.75rem] sm:px-6">
              <div className="mx-auto max-w-7xl md:px-8 lg:px-10">
                <ActionButtons {...props} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
