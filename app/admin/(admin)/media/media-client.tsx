"use client";

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "done" | "error";

type UploadResult = {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

type MediaHistoryItem = UploadResult & {
  id: string;
  createdAt: string;
  url?: string;
  publicId?: string;
  uploadedByUser?: {
    name: string | null;
    email: string | null;
  } | null;
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
const defaultFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? "cctt-club";

function formatBytes(bytes?: number) {
  if (!bytes || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} o`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} Ko`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} Mo`;
}

async function readJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function fallbackCopyText(text: string) {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export default function MediaUploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [folder, setFolder] = useState(defaultFolder);
  const [status, setStatus] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [history, setHistory] = useState<MediaHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cloudinaryReady = cloudName && uploadPreset;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function loadHistory() {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const res = await fetch("/api/admin/media");
      const json = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(json?.error ?? "Chargement impossible.");
      }
      setHistory(json.items ?? []);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Chargement impossible.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const meta = useMemo(() => {
    if (!result) return null;
    const dims =
      result.width && result.height
        ? `${result.width}x${result.height}`
        : "—";
    return {
      size: formatBytes(result.bytes),
      format: result.format ?? "—",
      dims,
    };
  }, [result]);

  async function handleUpload() {
    if (!file || !cloudinaryReady) return;
    setStatus("uploading");
    setError(null);
    setResult(null);
    setCopiedUrl(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", uploadPreset);
      if (folder.trim()) body.append("folder", folder.trim());

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: "POST",
          body,
        },
      );

      const json = (await res.json()) as UploadResult & {
        error?: { message?: string };
      };

      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Upload impossible.");
      }

      setResult(json);

      const saved = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: json.secure_url,
          publicId: json.public_id,
          format: json.format,
          bytes: json.bytes,
          width: json.width,
          height: json.height,
        }),
      });

      const savedJson = await readJsonSafe(saved);
      if (saved.ok && savedJson?.item) {
        setHistory((prev) => [savedJson.item, ...prev].slice(0, 50));
      } else {
        loadHistory();
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    }
  }

  function markUrlAsCopied(url: string) {
    setCopiedUrl(url);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedUrl((current) => (current === url ? null : current));
    }, 2200);
  }

  async function copyToClipboard(url: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (!fallbackCopyText(url)) {
        throw new Error("copy-failed");
      }
      markUrlAsCopied(url);
      return true;
    } catch {
      const copied = fallbackCopyText(url);
      if (copied) {
        markUrlAsCopied(url);
        return true;
      }
      setCopiedUrl(null);
      return false;
    }
  }

  function openUrl(url: string) {
    if (typeof window === "undefined" || !url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyUrl() {
    if (!result?.secure_url) return;
    await copyToClipboard(result.secure_url);
  }

  async function copyFromHistory(url: string) {
    await copyToClipboard(url);
  }

  async function removeFromHistory(id: string) {
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // ignore
    }
  }

  function getItemUrl(item: MediaHistoryItem) {
    return item.secure_url || item.url || "";
  }

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return history;
    return history.filter((item) => {
      const haystack = [
        item.public_id,
        item.publicId,
        item.url,
        item.secure_url,
        item.uploadedByUser?.name,
        item.uploadedByUser?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [history, search]);

  const latestUrl = result?.secure_url ?? null;
  const latestCopied = latestUrl ? copiedUrl === latestUrl : false;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Uploader un media</CardTitle>
          <CardDescription>
            Stockage Cloudinary simple. Uploadez une image puis copiez l&apos;URL
            publique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!cloudinaryReady && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Ajoutez{" "}
              <span className="font-medium">
                NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
              </span>{" "}
              et{" "}
              <span className="font-medium">
                NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
              </span>{" "}
              dans le `.env`, puis relancez le serveur.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Fichier a uploader
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setFile(event.currentTarget.files?.[0] ?? null)
                  }
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dossier Cloudinary</label>
                <input
                  value={folder}
                  onChange={(event) => setFolder(event.target.value)}
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="cctt-club"
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel, pratique pour ranger par pages (ex: `tournoi`).
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || !cloudinaryReady || status === "uploading"}
                className="w-full"
              >
                {status === "uploading"
                  ? "Upload en cours..."
                  : "Uploader"}
              </Button>

              {status === "error" && error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div
                className={cn(
                  "flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-4",
                  previewUrl ? "bg-transparent" : "text-muted-foreground",
                )}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="max-h-[220px] w-full rounded-lg object-contain"
                  />
                ) : (
                  <span className="text-sm">Aperçu de l&apos;image</span>
                )}
              </div>

              {result && (
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="text-sm font-medium">Media uploade</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Format: {meta?.format}</div>
                    <div>Dimensions: {meta?.dims}</div>
                    <div>Taille: {meta?.size}</div>
                  </div>
                  <div
                    className={cn(
                      "block w-full space-y-3 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                      latestCopied
                        ? "border-emerald-500/50 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-border bg-background/70",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-medium text-muted-foreground">
                        URL publique
                      </label>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[11px] font-medium transition-colors",
                          latestCopied
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {latestCopied ? "Copiee" : "Cliquer pour copier"}
                      </span>
                    </div>
                    <input
                      readOnly
                      value={result.secure_url}
                      className={cn(
                        "block w-full truncate rounded-md border px-3 py-2 text-sm transition-colors",
                        latestCopied
                          ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                          : "border-border bg-background",
                      )}
                    />
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      {latestCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                          URL copitee dans le presse-papiers
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Utilisez le bouton pour copier l'URL
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={latestCopied ? "default" : "secondary"}
                      onClick={copyUrl}
                      className={cn(
                        "min-w-[170px] font-semibold transition-all",
                        latestCopied &&
                          "bg-emerald-600 text-white hover:bg-emerald-600/90",
                      )}
                    >
                      {latestCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {latestCopied ? "URL copiee" : "Copier l'URL"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-w-[120px]"
                      onClick={() => openUrl(result.secure_url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ouvrir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derniers medias uploades</CardTitle>
          <CardDescription>
            Historique partage entre admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {history.length} media{history.length > 1 ? "s" : ""}
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher (nom, url, admin)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>

          {historyLoading ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : historyError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {historyError}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Aucun media trouve.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHistory.map((item) => {
                const itemUrl = getItemUrl(item);
                const itemCopied = copiedUrl === itemUrl;

                return (
                  <div
                  key={item.id}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-card transition-colors",
                    itemCopied ? "border-emerald-500/40" : "border-border",
                  )}
                >
                  <div className="aspect-[4/3] bg-muted/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={itemUrl}
                      alt={item.public_id ?? item.publicId ?? "Media"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-2 p-3 text-xs text-muted-foreground">
                    <div className="truncate font-medium text-foreground">
                      {item.public_id ?? item.publicId ?? "Media"}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{formatBytes(item.bytes)}</span>
                      <span>
                        {item.width && item.height
                          ? `${item.width}x${item.height}`
                          : "—"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyFromHistory(itemUrl)}
                      className={cn(
                        "block w-full truncate rounded-lg border px-2.5 py-2 text-left font-mono text-[11px] transition-colors",
                        itemCopied
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-border/70 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
                      )}
                      title={itemUrl}
                    >
                      {itemUrl}
                    </button>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span
                        className={cn(
                          "font-medium",
                          itemCopied
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground",
                        )}
                      >
                        {itemCopied ? "URL copitee" : "Cliquez sur l'URL pour copier"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={itemCopied ? "default" : "secondary"}
                        onClick={() => copyFromHistory(itemUrl)}
                        className={cn(
                          "font-semibold transition-all",
                          itemCopied &&
                            "bg-emerald-600 text-white hover:bg-emerald-600/90",
                        )}
                      >
                        {itemCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {itemCopied ? "Copiee" : "Copier URL"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openUrl(itemUrl)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromHistory(item.id)}
                      >
                        Retirer
                      </Button>
                    </div>
                    <div className="text-[11px]">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {item.uploadedByUser?.name ||
                    item.uploadedByUser?.email ? (
                      <div className="text-[11px] text-muted-foreground">
                        Par {item.uploadedByUser.name ?? item.uploadedByUser.email}
                      </div>
                    ) : null}
                  </div>
                  </div>
                );
            })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequis Cloudinary</CardTitle>
          <CardDescription>
            Creez un upload preset en mode unsigned (cloudinary dashboard).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Env vars attendues :</div>
          <ul className="list-disc pl-5">
            <li>`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`</li>
            <li>`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`</li>
            <li>`NEXT_PUBLIC_CLOUDINARY_FOLDER` (optionnel)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
