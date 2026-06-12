"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type VisibilityOption = {
  key: string;
  label: string;
  description: string;
};

type AdminTournamentVisibilityControlsProps = {
  title?: string;
  description?: string;
  options: VisibilityOption[];
};

export default function AdminTournamentVisibilityControls({
  title = "Options de test admin",
  description = "Ces affichages restent masqués pour les visiteurs. Les cases ci-dessous n'affectent que votre vue actuelle.",
  options,
}: AdminTournamentVisibilityControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateOption(key: string, checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set(key, "1");
    } else {
      params.delete(key);
    }

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  return (
    <aside className="rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {options.map((option) => {
          const checked = searchParams.get(option.key) === "1";

          return (
            <label
              key={option.key}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 p-3"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
                checked={checked}
                disabled={isPending}
                onChange={(event) =>
                  updateOption(option.key, event.target.checked)
                }
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
