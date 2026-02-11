"use client";

import { useState, type FormEvent } from "react";

type FFTTPlayer = {
  licence: string;
  firstName: string;
  lastName: string;
  fullName: string;
  club?: string;
  ranking?: string;
  gender?: string;
  points?: number;
  category?: string;
  clubId?: string;
  licenceType?: string;
  validationDate?: string;
};

export function FFTTPlayerLookupForm() {
  const [licence, setLicence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<FFTTPlayer | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPlayer(null);

    const trimmed = licence.replace(/\s/g, "").trim();

    if (trimmed.length < 7) {
      setError("Merci de saisir un numéro de licence valide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/fftt/player-by-licence?licence=${encodeURIComponent(trimmed)}`);
      const data = (await response.json()) as {
        message?: string;
        player?: FFTTPlayer;
      };

      if (!response.ok || !data.player) {
        setError(data.message ?? "Impossible de trouver ce joueur.");
        return;
      }

      setPlayer(data.player);
    } catch {
      setError("Erreur réseau. Merci de réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
      <h2 className="text-xl font-semibold">Rechercher un joueur FFTT</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="licence" className="block text-sm font-medium text-gray-700">
            Numéro de licence FFTT
          </label>
          <input
            id="licence"
            type="text"
            value={licence}
            onChange={(event) => setLicence(event.target.value)}
            placeholder="Ex: 12345678"
            className="w-full max-w-sm rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
        >
          {loading ? "Recherche..." : "Récupérer le joueur"}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {player && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900 space-y-2">
          <p>
            <strong>Joueur :</strong> {player.fullName || `${player.firstName} ${player.lastName}`}
          </p>
          <p>
            <strong>Licence :</strong> {player.licence}
          </p>
          {(player.club || player.clubId) && (
            <p>
              <strong>Club :</strong> {player.club ?? "-"} {player.clubId ? `(${player.clubId})` : ""}
            </p>
          )}
          {player.licenceType && (
            <p>
              <strong>Type licence :</strong> {player.licenceType}
            </p>
          )}
          {player.ranking && (
            <p>
              <strong>Classement / points officiels :</strong> {player.ranking}
            </p>
          )}
          {player.validationDate && (
            <p>
              <strong>Validation :</strong> {player.validationDate}
            </p>
          )}
          {typeof player.points === "number" && (
            <p>
              <strong>Points :</strong> {player.points}
            </p>
          )}
          <p className="text-xs text-green-800 pt-1">
            Étape suivante : pré-remplir le formulaire d'inscription avec ces données.
          </p>
        </div>
      )}
    </section>
  );
}
