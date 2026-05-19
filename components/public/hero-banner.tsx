"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useRef } from "react";

type HeroBannerProps = {
  imageUrl: string;
};

export function HeroBanner({ imageUrl }: HeroBannerProps) {
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
    const imageScale = isNeutral ? 1 : 1.025;

    media.style.transform = `translate3d(${x * 8}px, ${y * 6}px, 0) scale(${imageScale})`;
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
      className="hero-banner group relative overflow-hidden rounded-[0.8rem]"
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
    </div>
  );
}
