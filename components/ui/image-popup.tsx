"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ImagePopupProps = {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  previewClassName?: string;
  popupImageClassName?: string;
  shareLabel?: string;
};

export function ImagePopup({
  src,
  alt,
  title,
  width = 320,
  height = 400,
  previewClassName,
  popupImageClassName,
  shareLabel,
}: ImagePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const absoluteUrl = new URL(src, window.location.origin).toString();
    const titleText = shareLabel ?? title ?? alt;

    if (navigator.share) {
      try {
        await navigator.share({
          title: titleText,
          text: titleText,
          url: absoluteUrl,
        });
      } catch {
        // ignore share cancel
      }
      return;
    }

    await navigator.clipboard.writeText(absoluteUrl);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full text-left"
        aria-label={`Agrandir ${title ?? alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={previewClassName}
        />
      </button>

      {isOpen && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title ?? alt}
              onClick={() => setIsOpen(false)}
            >
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleShare();
                  }}
                >
                  Partager
                </button>
                <button
                  type="button"
                  className="rounded-md bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer l'aperçu"
                >
                  Fermer
                </button>
              </div>

              <div
                className="max-h-[90vh] max-w-[90vw]"
                onClick={(event) => event.stopPropagation()}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={1600}
                  className={
                    popupImageClassName ??
                    "max-h-[90vh] w-auto rounded-md object-contain"
                  }
                  priority
                />
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
