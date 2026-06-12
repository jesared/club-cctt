"use client";

import { MapPin } from "lucide-react";

type ExternalMapLinkProps = {
  href: string;
  label: string;
  className?: string;
  showIcon?: boolean;
};

export function ExternalMapLink({
  href,
  label,
  className,
  showIcon = true,
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
      {showIcon ? <MapPin className="h-4 w-4" /> : null}
      {label}
    </a>
  );
}
