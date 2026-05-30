"use client";

import { MapPin } from "lucide-react";

type ExternalMapLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function ExternalMapLink({
  href,
  label,
  className,
}: ExternalMapLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
    >
      <MapPin className="h-4 w-4" />
      {label}
    </a>
  );
}
