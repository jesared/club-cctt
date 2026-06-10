"use client";

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  LayoutGrid,
  List,
  MoreVertical,
} from "lucide-react";
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
type HistoryView = "grid" | "list";

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

type MediaActionsMenuProps = {
  id: string;
  itemUrl: string;
  itemCopied: boolean;
  onCopy: (url: string) => Promise<void>;
  onOpen: (url: string) => void;
  onRemove: (id: string) => Promise<void>;
};

type MediaUrlInputGroupProps = MediaActionsMenuProps & {
  copyLabel?: string;
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

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "short",
    timeStyle: "short",
  });
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

function MediaActionsMenu({
  id,
  itemUrl,
  itemCopied,
  onCopy,
  onOpen,
  onRemove,
}: MediaActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function openMenu(button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();
    const menuWidth = 168;
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

  async function handleCopy() {
    await onCopy(itemUrl);
    setOpen(false);
  }

  function handleOpen() {
    onOpen(itemUrl);
    setOpen(false);
  }

  async function handleRemove() {
    await onRemove(id);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn("size-8", open && "bg-muted")}
        onClick={(event) => {
          if (open) {
            setOpen(false);
            return;
          }

          openMenu(event.currentTarget);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ouvrir les actions du media"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open && menuPosition ? (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 min-w-40 rounded-md border bg-popover p-1 shadow-lg"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-muted"
          >
            {itemCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {itemCopied ? "Copié" : "Copier URL"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleOpen}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleRemove}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs text-destructive hover:bg-muted"
          >
            Retirer
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MediaUrlInputGroup({
  id,
  itemUrl,
  itemCopied,
  onCopy,
  onOpen,
  onRemove,
  copyLabel = "URL du media",
}: MediaUrlInputGroupProps) {
  return (
    <div
      className={cn(
        "flex min-h-9 w-full overflow-hidden rounded-lg border bg-background transition-colors",
        itemCopied
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-border/70 hover:border-primary/40",
      )}
    >
      <button
        type="button"
        onClick={() => onCopy(itemUrl)}
        className={cn(
          "min-w-0 flex-1 truncate px-2.5 py-2 text-left font-mono text-[11px] transition-colors",
          itemCopied
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-muted-foreground hover:bg-primary/5",
        )}
        title={itemUrl}
        aria-label={copyLabel}
      >
        {itemUrl}
      </button>
      <div className="flex shrink-0 items-center border-l border-border/70 bg-muted/20 px-1">
        <MediaActionsMenu
          id={id}
          itemUrl={itemUrl}
          itemCopied={itemCopied}
          onCopy={onCopy}
          onOpen={onOpen}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
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
  const [historyView, setHistoryView] = useState<HistoryView>("list");
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
            <div className="flex min-h-10 w-full overflow-hidden rounded-lg border border-border bg-background shadow-sm sm:w-[420px]">
              <div
                className="flex shrink-0 items-center gap-1 border-r border-border bg-muted/30 p-1"
                role="group"
                aria-label="Vue de l'historique media"
              >
                <Button
                  type="button"
                  size="icon"
                  variant={historyView === "grid" ? "default" : "ghost"}
                  className="size-8 rounded-md"
                  onClick={() => setHistoryView("grid")}
                  aria-pressed={historyView === "grid"}
                  title="Vue grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Vue grille</span>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={historyView === "list" ? "default" : "ghost"}
                  className="size-8 rounded-md"
                  onClick={() => setHistoryView("list")}
                  aria-pressed={historyView === "list"}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">Vue liste</span>
                </Button>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher (nom, url, admin)"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
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
          ) : historyView === "grid" ? (
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
                    <MediaUrlInputGroup
                      id={item.id}
                      itemUrl={itemUrl}
                      itemCopied={itemCopied}
                      onCopy={copyFromHistory}
                      onOpen={openUrl}
                      onRemove={removeFromHistory}
                    />
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span
                        className={cn(
                          "font-medium",
                          itemCopied
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground",
                        )}
                      >
                        {itemCopied ? (
                          <span className="inline-flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Copié
                          </span>
                        ) : (
                          "Cliquez sur l'URL pour copier"
                        )}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      {formatCreatedAt(item.createdAt)}
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
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const itemUrl = getItemUrl(item);
                const itemCopied = copiedUrl === itemUrl;
                const title = item.public_id ?? item.publicId ?? "Media";
                const dimensions =
                  item.width && item.height
                    ? `${item.width}x${item.height}`
                    : "—";
                const uploader =
                  item.uploadedByUser?.name ?? item.uploadedByUser?.email;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "grid gap-3 rounded-xl border bg-card p-3 transition-colors sm:grid-cols-[96px_minmax(0,1fr)]",
                      itemCopied ? "border-emerald-500/40" : "border-border",
                    )}
                  >
                    <div className="h-24 overflow-hidden rounded-lg bg-muted/40 sm:h-24 sm:w-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={itemUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0 space-y-2 text-xs text-muted-foreground">
                      <div className="truncate text-sm font-medium text-foreground">
                        {title}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{formatBytes(item.bytes)}</span>
                        <span>{dimensions}</span>
                        <span>{formatCreatedAt(item.createdAt)}</span>
                        {uploader ? <span>Par {uploader}</span> : null}
                      </div>
                      <MediaUrlInputGroup
                        id={item.id}
                        itemUrl={itemUrl}
                        itemCopied={itemCopied}
                        onCopy={copyFromHistory}
                        onOpen={openUrl}
                        onRemove={removeFromHistory}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
