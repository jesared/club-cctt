"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ChecklistItem = {
  title: string;
  description: string;
  href: string;
};

const CHECKLIST: ChecklistItem[] = [
  {
    title: "1. Activer le bon tournoi",
    description: "Le tournoi actif alimente l'inscription et le tableau public.",
    href: "/admin/tournoi",
  },
  {
    title: "2. Modifier le tournoi",
    description: "Dates, lieu, description et statut (avant le démarrage).",
    href: "/admin/tournoi",
  },
  {
    title: "3. Ajuster les tableaux",
    description: "Horaires, points, frais et quotas.",
    href: "/admin/tournoi",
  },
  {
    title: "4. Vérifier les inscriptions",
    description: "Contrôler les statuts et détecter les doublons.",
    href: "/admin/tournoi/inscriptions",
  },
  {
    title: "5. Contrôler les paiements",
    description: "Relancer les dossiers non soldés.",
    href: "/admin/tournoi/paiement",
  },
  {
    title: "6. Préparer les pointages",
    description: "Pointage des joueurs le jour J.",
    href: "/admin/tournoi/pointages",
  },
  {
    title: "7. Exporter",
    description: "Fichiers pour juge-arbitre et caisse.",
    href: "/admin/tournoi/exports",
  },
];

export function ActionsChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("admin.tournoi.checklist");
    if (stored) {
      try {
        setChecked(JSON.parse(stored));
      } catch {
        setChecked({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin.tournoi.checklist", JSON.stringify(checked));
  }, [checked]);

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Checklist de gestion
        </h2>
        <p className="text-sm text-muted-foreground">
          Suivez cet ordre pour éviter les oublis.
        </p>
      </div>

      <div className="grid gap-3">
        {CHECKLIST.map((item) => {
          const isChecked = checked[item.title] ?? false;

          return (
            <div
              key={item.title}
              className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border"
                  checked={isChecked}
                  onChange={(event) =>
                    setChecked((prev) => ({
                      ...prev,
                      [item.title]: event.target.checked,
                    }))
                  }
                />
                <div className="flex-1">
                  <Link href={item.href} className="text-sm font-semibold text-foreground hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
