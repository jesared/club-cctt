"use client";

import dynamic from "next/dynamic";

type WinnerSlide = {
  label: string;
  year: number;
  name: string;
  imageSrc: string;
  imageAlt: string;
};

type WinnersCarouselLazyProps = {
  items: WinnerSlide[];
};

const WinnersCarousel = dynamic(
  () => import("./winners-carousel").then((mod) => mod.WinnersCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-40 animate-pulse rounded bg-muted" />
      </div>
    ),
  },
);

export default function WinnersCarouselLazy({ items }: WinnersCarouselLazyProps) {
  return <WinnersCarousel items={items} />;
}
