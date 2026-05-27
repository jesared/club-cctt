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
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function openMenu(button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();
    const menuWidth = 144;
    const menuHeight = 132;
    const viewportGap = 8;

    setMenuPosition({
      top: Math.min(
        rect.bottom + viewportGap,
        window.innerHeight - menuHeight - viewportGap,
      ),
      left: Math.max(
        viewportGap,
        Math.min(
          rect.right - menuWidth,
          window.innerWidth - menuWidth - viewportGap,
        ),
      ),
    });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        target &&
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function closeMenu() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        type="button"
        onClick={(event) => {
          if (open) {
            setOpen(false);
            return;
          }

          openMenu(event.currentTarget);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ouvrir les actions du dossier"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && menuPosition ? (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 min-w-36 rounded-md border bg-popover p-1 shadow-lg"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          <Link
            href={`/admin/tournoi/ajout-player?edit=${playerId}`}
            className="block rounded px-3 py-2 text-xs hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            &Eacute;diter
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
