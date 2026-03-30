"use client";

import dynamic from "next/dynamic";

const TournoiHero = dynamic(() => import("@/components/TournoiHero"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-muted/30 p-6">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-48 animate-pulse rounded bg-muted" />
    </div>
  ),
});

export default function TournoiHeroLazy() {
  return <TournoiHero />;
}
