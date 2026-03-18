"use client";

import Image from "next/image";
import { useState } from "react";

type ImagePopupProps = {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  previewClassName?: string;
  popupImageClassName?: string;
};

export function ImagePopup({
  src,
  alt,
  title,
  width = 320,
  height = 400,
  previewClassName,
  popupImageClassName,
}: ImagePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? alt}
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="cursor-pointer absolute right-4 top-4 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer l'aperçu"
          >
            Fermer
          </button>

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
        </div>
      ) : null}
    </>
  );
}
