"use client";

import { type PointerEvent, useEffect, useRef } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeroBannerProps = {
  imageUrl: string;
  registrationLabel: string;
  tournamentName: string;
  tournamentDateLabel: string;
  tournamentVenue: string;
};

export function HeroBanner({
  imageUrl,
  registrationLabel,
  tournamentName,
  tournamentDateLabel,
  tournamentVenue,
}: HeroBannerProps) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCapability = () => {
      enabledRef.current = hoverQuery.matches && !motionQuery.matches;
    };

    updateCapability();
    hoverQuery.addEventListener("change", updateCapability);
    motionQuery.addEventListener("change", updateCapability);

    return () => {
      hoverQuery.removeEventListener("change", updateCapability);
      motionQuery.removeEventListener("change", updateCapability);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const applyTransforms = () => {
    frameRef.current = null;

    const media = mediaRef.current;
    const { x, y } = targetRef.current;

    if (!media) {
      return;
    }

    const isNeutral = x === 0 && y === 0;
    const imageScale = isNeutral ? 1 : 1.055;

    media.style.transform = `translate3d(${x * 14}px, ${y * 10}px, 0) scale(${imageScale})`;
  };

  const scheduleFrame = () => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(applyTransforms);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    targetRef.current = { x, y };
    scheduleFrame();
  };

  const resetTransforms = () => {
    if (!enabledRef.current) {
      return;
    }

    targetRef.current = { x: 0, y: 0 };
    scheduleFrame();
  };

  return (
    <div
      className="hero-banner group relative overflow-hidden rounded-[1.75rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTransforms}
    >
      <div className="hero-banner-frame">
        <div ref={mediaRef} className="hero-banner-media">
          <Image
            src={imageUrl}
            alt="Photo du club CCTT"
            width={1600}
            height={900}
            className="h-[300px] w-full object-cover object-center md:h-[330px] lg:h-[350px]"
            priority
          />
        </div>
      </div>
      <div className="hero-banner-scrim absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
      <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
        <div className="hero-banner-card max-w-xl space-y-4 rounded-[1.35rem] bg-black/34 p-5 text-white backdrop-blur-[2px] md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              A la une
            </p>
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-sm font-medium text-white">
              {registrationLabel}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight md:text-3xl">
              {tournamentName}
            </p>
            <p className="text-sm leading-relaxed text-white/82 md:text-base">
              Toutes les informations utiles du prochain temps fort du club,
              sans quitter la page d&apos;accueil.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-white/82">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {tournamentDateLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {tournamentVenue}
            </span>
          </div>
          <Button
            asChild
            variant="secondary"
            className="rounded-full bg-white text-foreground hover:bg-white/90"
          >
            <Link href="/tournoi">Voir la page tournoi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
