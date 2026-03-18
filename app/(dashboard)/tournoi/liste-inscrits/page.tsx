"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Player = {
  id: string;
  nom: string;
  prenom: string;
  club: string;
  points: number;
};

type Tableau = {
  id: string;
  nom: string;
  joueurs: Player[];
};

const data: Tableau[] = [
  {
    id: "1",
    nom: "Tableau 500-899",
    joueurs: [
      {
        id: "1",
        nom: "Hautier",
        prenom: "Jean-Marc",
        club: "CCTT",
        points: 580,
      },
    ],
  },
  {
    id: "2",
    nom: "Tableau 900-1599",
    joueurs: [
      {
        id: "2",
        nom: "Dupont",
        prenom: "Lucas",
        club: "Reims TT",
        points: 1420,
      },
    ],
  },
];

export default function PlayersByTable() {
  const [selectedTableau, setSelectedTableau] = useState<string | "all">("all");

  // 🔥 scroll top quand filtre change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedTableau]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* HEADER */}
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Liste des inscrits</h1>

        {/* 🔥 FILTRES */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTableau("all")}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1 text-sm transition",
              selectedTableau === "all"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            Tous
          </button>

          {data.map((tableau) => (
            <button
              key={tableau.id}
              onClick={() => setSelectedTableau(tableau.id)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1 text-sm transition",
                selectedTableau === tableau.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {tableau.nom}
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 LISTE PAR TABLEAU */}
      {data
        .filter(
          (tableau) =>
            selectedTableau === "all" || tableau.id === selectedTableau,
        )
        .map((tableau) => {
          // 🔥 tri par points (desc)
          const joueurs = [...tableau.joueurs].sort(
            (a, b) => b.points - a.points,
          );

          return (
            <section key={tableau.id} className="space-y-4">
              {/* HEADER TABLEAU */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{tableau.nom}</h2>
                <span className="text-sm text-muted-foreground">
                  {joueurs.length} joueurs
                </span>
              </div>

              {/* DESKTOP */}
              <div className="hidden md:block">
                <div className="overflow-hidden rounded-xl border bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Nom</th>
                        <th className="px-4 py-3 text-left">Club</th>
                        <th className="px-4 py-3 text-left">Points</th>
                      </tr>
                    </thead>

                    <tbody>
                      {joueurs.map((player, index) => (
                        <tr
                          key={player.id}
                          className="border-t transition hover:bg-muted/40"
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            {player.nom} {player.prenom}
                          </td>

                          <td className="px-4 py-3">{player.club}</td>

                          <td className="px-4 py-3">{player.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE */}
              <div className="space-y-3 md:hidden">
                {joueurs.map((player, index) => (
                  <div
                    key={player.id}
                    className="rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {index + 1}. {player.nom} {player.prenom}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {player.points} pts
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {player.club}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
    </main>
  );
}
