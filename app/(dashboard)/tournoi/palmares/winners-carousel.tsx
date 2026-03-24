"use client";

import { useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WinnerSlide = {
  label: string;
  year: number;
  name: string;
  imageSrc: string;
  imageAlt: string;
};

type WinnersCarouselProps = {
  items: WinnerSlide[];
};

export function WinnersCarousel({ items }: WinnersCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBySlide = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>("[data-slide]");
    const slideWidth = slide?.offsetWidth ?? track.clientWidth;
    track.scrollBy({ left: direction * (slideWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Highlights recentes
          </p>
          <h2 className="text-xl font-semibold">Vainqueurs a la une</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBySlide(-1)}
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Precedent
          </button>
          <button
            type="button"
            onClick={() => scrollBySlide(1)}
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Suivant
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-thin"
      >
        {items.map((item) => (
          <Card
            key={`${item.label}-${item.year}-${item.name}`}
            data-slide
            className="min-w-[260px] max-w-[320px] snap-start bg-accent"
          >
            <CardHeader>
              <CardTitle className="space-y-1">
                <p className="text-xs">{item.label} {item.year}</p>
                <span>{item.name || "-"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 768px) 80vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
