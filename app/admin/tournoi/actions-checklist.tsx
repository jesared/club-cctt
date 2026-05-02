"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, CircleDashed } from "lucide-react";

type ChecklistStatus = "done" | "warning" | "info";

export type AutoChecklistItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  status: ChecklistStatus;
};

type ManualChecklistItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

type ActionsChecklistProps = {
  autoItems: AutoChecklistItem[];
};

const MANUAL_ITEMS: ManualChecklistItem[] = [
  {
    id: "signals",
    title: "Valider la mise en avant publique",
    description: "Verifier rapidement la home, les affiches et les messages visibles aux joueurs.",
    href: "/admin/tournoi",
  },
  {
    id: "desk",
    title: "Preparer la table d'accueil",
    description: "Confirmer badges, caisse, listing et materiel de pointage.",
    href: "/admin/tournoi/pointages",
  },
  {
    id: "exports",
    title: "Faire un dernier test d'export",
    description: "Verifier que les fichiers juge-arbitre et caisse sortent correctement.",
    href: "/admin/tournoi/exports",
  },
];

function getStatusPresentation(status: ChecklistStatus) {
  switch (status) {
    case "done":
      return {
        label: "OK",
        icon: CheckCircle2,
        tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconTone: "text-emerald-600",
      };
    case "warning":
      return {
        label: "A verifier",
        icon: AlertCircle,
        tone: "border-amber-200 bg-amber-50 text-amber-800",
        iconTone: "text-amber-600",
      };
    case "info":
    default:
      return {
        label: "A suivre",
        icon: CircleDashed,
        tone: "border-sky-200 bg-sky-50 text-sky-700",
        iconTone: "text-sky-600",
      };
  }
}

export function ActionsChecklist({ autoItems }: ActionsChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("admin.tournoi.manual-checklist");
    if (stored) {
      try {
        setChecked(JSON.parse(stored));
      } catch {
        setChecked({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin.tournoi.manual-checklist", JSON.stringify(checked));
  }, [checked]);

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Checklist de gestion
        </h2>
        <p className="text-sm text-muted-foreground">
          Les statuts utiles remontent automatiquement, le reste reste en controle manuel.
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Statuts automatiques
        </p>
        <div className="grid gap-2.5">
          {autoItems.map((item) => {
            const statusPresentation = getStatusPresentation(item.status);
            const StatusIcon = statusPresentation.icon;

            return (
              <div
                key={item.id}
                className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={item.href}
                        className="text-sm font-semibold text-foreground hover:underline"
                      >
                        {item.title}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusPresentation.tone}`}
                      >
                        <StatusIcon className={`h-3.5 w-3.5 ${statusPresentation.iconTone}`} />
                        {statusPresentation.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    aria-label={`Ouvrir ${item.title}`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Verifications manuelles
        </p>
        <div className="grid gap-2.5">
          {MANUAL_ITEMS.map((item) => {
            const isChecked = checked[item.id] ?? false;

            return (
              <div
                key={item.id}
                className="rounded-lg border p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border"
                    checked={isChecked}
                    onChange={(event) =>
                      setChecked((prev) => ({
                        ...prev,
                        [item.id]: event.target.checked,
                      }))
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.href}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
