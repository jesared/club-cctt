"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RecentPlayerActionsMenuProps = {
  playerId: string;
  paymentGroupKey: string;
  licence: string;
};

export function RecentPlayerActionsMenu({
  playerId,
  paymentGroupKey,
  licence,
}: RecentPlayerActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (target && !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ouvrir les actions du dossier"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-10 z-20 min-w-36 rounded-md border bg-popover p-1 shadow-lg"
        >
          <Link
            href={`/admin/tournoi/ajout-player?edit=${playerId}`}
            className="block rounded px-3 py-2 text-xs hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Éditer
          </Link>
          <Link
            href={`/admin/tournoi/paiement?dossier=${encodeURIComponent(paymentGroupKey)}`}
            className="block rounded px-3 py-2 text-xs hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Paiement
          </Link>
          <Link
            href={`/admin/tournoi/pointages?q=${encodeURIComponent(licence)}`}
            className="block rounded px-3 py-2 text-xs hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Pointages
          </Link>
        </div>
      ) : null}
    </div>
  );
}
