"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BellPlus,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NotificationItem = {
  id: string;
  type: "ANNOUNCEMENT" | "DOCUMENT" | "SCHEDULE" | "TOURNAMENT" | "SYSTEM";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  title: string;
  content: string;
  href: string | null;
  sourceId: string | null;
  sourceKind: "MESSAGE" | "DOCUMENT" | "HORAIRES" | "TOURNAMENT" | "MANUAL";
  audience:
    | "ALL_MEMBERS"
    | "CLUB_SPACE"
    | "BUREAU_SPACE"
    | "ENTRAINEUR_SPACE"
    | "ADMIN_ONLY"
    | "ROLE";
  roleScope: "USER" | "CLUB" | "BUREAU" | "ENTRAINEUR" | "ADMIN" | null;
  publishedAt: string;
  expiresAt: string | null;
  createdByUser: {
    name: string | null;
    email: string | null;
  } | null;
  _count: {
    reads: number;
  };
};

type DraftNotification = {
  type: NotificationItem["type"];
  priority: NotificationItem["priority"];
  title: string;
  content: string;
  href: string;
  audience: NotificationItem["audience"];
  roleScope: NonNullable<NotificationItem["roleScope"]>;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
};

type NotificationFilter = "ALL" | "AUTO" | "MANUAL" | "IMPORTANT";

const AUDIENCE_LABELS: Record<NotificationItem["audience"], string> = {
  ALL_MEMBERS: "Tous",
  CLUB_SPACE: "Club",
  BUREAU_SPACE: "Bureau",
  ENTRAINEUR_SPACE: "Entraineur",
  ADMIN_ONLY: "Admin",
  ROLE: "Role cible",
};

const TYPE_LABELS: Record<NotificationItem["type"], string> = {
  ANNOUNCEMENT: "Annonce",
  DOCUMENT: "Document",
  SCHEDULE: "Planning",
  TOURNAMENT: "Tournoi",
  SYSTEM: "Systeme",
};

const EMPTY_DRAFT: DraftNotification = {
  type: "SYSTEM",
  priority: "NORMAL",
  title: "",
  content: "",
  href: "",
  audience: "ALL_MEMBERS",
  roleScope: "USER",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

async function getResponseErrorMessage(response: Response, fallback: string) {
  const json = await readJsonSafe(response);
  if (json && typeof json.error === "string" && json.error.trim()) {
    return json.error;
  }

  return fallback;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [draft, setDraft] = useState<DraftNotification>(EMPTY_DRAFT);
  const [publishAttempted, setPublishAttempted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<NotificationItem | null>(null);
  const [editAttempted, setEditAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepublishingId, setIsRepublishingId] = useState<string | null>(null);
  const [deletingNotification, setDeletingNotification] =
    useState<NotificationItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const importantCount = useMemo(
    () =>
      notifications.filter((notification) =>
        ["HIGH", "URGENT"].includes(notification.priority),
      ).length,
    [notifications],
  );
  const automaticCount = useMemo(
    () =>
      notifications.filter((notification) => notification.sourceKind !== "MANUAL")
        .length,
    [notifications],
  );
  const manualCount = notifications.length - automaticCount;

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "AUTO"
            ? notification.sourceKind !== "MANUAL"
            : filter === "MANUAL"
              ? notification.sourceKind === "MANUAL"
              : ["HIGH", "URGENT"].includes(notification.priority);

      const matchesSearch = normalizedSearch
        ? `${notification.title} ${notification.content} ${notification.sourceKind} ${notification.type}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesFilter && matchesSearch;
    });
  }, [filter, notifications, searchTerm]);

  const composeTitleError = publishAttempted && !draft.title.trim();
  const composeContentError = publishAttempted && !draft.content.trim();
  const composeRoleError =
    publishAttempted && draft.audience === "ROLE" && !draft.roleScope;
  const editTitleError = editAttempted && !!editing && !editing.title.trim();
  const editContentError =
    editAttempted && !!editing && !editing.content.trim();

  const showToast = useCallback((tone: ToastState["tone"], message: string) => {
    setToast({ tone, message });
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoadError(null);

    const response = await fetch("/api/admin/notifications");
    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(
          response,
          "Impossible de charger les notifications.",
        ),
      );
    }

    const data = (await response.json()) as NotificationItem[];
    setNotifications(data);
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      await loadNotifications();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Impossible de charger les notifications.";
      setLoadError(message);
      showToast("error", message);
    } finally {
      setIsLoading(false);
    }
  }, [loadNotifications, showToast]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  async function createNotification() {
    setPublishAttempted(true);

    if (
      !draft.title.trim() ||
      !draft.content.trim() ||
      (draft.audience === "ROLE" && !draft.roleScope)
    ) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: draft.type,
          priority: draft.priority,
          title: draft.title,
          content: draft.content,
          href: draft.href.trim() || null,
          audience: draft.audience,
          roleScope: draft.audience === "ROLE" ? draft.roleScope : null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "Erreur lors de la creation de la notification.",
          ),
        );
      }

      const created = (await response.json()) as NotificationItem;
      setNotifications((current) => [created, ...current]);
      setDraft(EMPTY_DRAFT);
      setPublishAttempted(false);
      showToast("success", "Notification envoyee.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de la creation de la notification.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;

    setEditAttempted(true);

    if (!editing.title.trim() || !editing.content.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/notifications/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          content: editing.content,
          href: editing.href,
          priority: editing.priority,
          audience: editing.audience,
          roleScope: editing.audience === "ROLE" ? editing.roleScope : null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "Erreur lors de la mise a jour de la notification.",
          ),
        );
      }

      const updated = (await response.json()) as NotificationItem;
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditing(null);
      setEditAttempted(false);
      showToast("success", "Notification mise a jour.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de la mise a jour de la notification.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function republishNotification(id: string) {
    setIsRepublishingId(id);

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ republish: true }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "Erreur lors de la republication.",
          ),
        );
      }

      const updated = (await response.json()) as NotificationItem;
      setNotifications((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime(),
          ),
      );
      showToast("success", "Notification republiee.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de la republication.",
      );
    } finally {
      setIsRepublishingId(null);
    }
  }

  async function deleteNotification(id: string) {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "Erreur lors de la suppression de la notification.",
          ),
        );
      }

      setNotifications((current) => current.filter((item) => item.id !== id));
      setDeletingNotification(null);
      showToast("success", "Notification supprimee.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de la suppression de la notification.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
        <CardHeader className="gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Administration
            </p>
            <CardTitle className="text-3xl">Notifications diffusees</CardTitle>
          </div>
          <CardDescription className="max-w-3xl text-sm leading-6">
            Visualise les notifications creees automatiquement, corrige leur
            contenu si besoin, publie une alerte manuelle ou supprime une
            diffusion devenue obsolete.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Notifications"
          value={notifications.length}
          helper="historique charge"
        />
        <MetricCard
          label="Automatiques"
          value={automaticCount}
          helper="issues des workflows"
        />
        <MetricCard
          label="Manuelles"
          value={manualCount}
          helper="cree(es) depuis l'admin"
        />
        <MetricCard
          label="Importantes"
          value={importantCount}
          helper="priorite haute ou urgente"
        />
      </div>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader className="gap-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BellPlus className="h-5 w-5 text-primary" />
            Envoyer une notification manuelle
          </CardTitle>
          <CardDescription>
            Utilise ce bloc pour pousser une info sans passer par une annonce
            ou une mise a jour de planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Titre</span>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Ex: Salle fermee exceptionnellement vendredi"
                className="h-11 rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              />
              {composeTitleError ? (
                <span className="text-sm font-medium text-destructive">
                  Le titre est obligatoire.
                </span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Lien cible</span>
              <input
                value={draft.href}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    href: event.target.value,
                  }))
                }
                placeholder="/user/club/agenda"
                className="h-11 rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Contenu</span>
            <textarea
              value={draft.content}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              placeholder="Ajoute ici le contexte utile, la date concernee et l'action attendue."
              className="min-h-32 rounded-xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
            {composeContentError ? (
              <span className="text-sm font-medium text-destructive">
                Le contenu est obligatoire.
              </span>
            ) : null}
          </label>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Type</span>
              <select
                value={draft.type}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value as DraftNotification["type"],
                  }))
                }
                className="h-11 rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Priorite</span>
              <select
                value={draft.priority}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    priority: event.target.value as DraftNotification["priority"],
                  }))
                }
                className="h-11 rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Audience</span>
              <select
                value={draft.audience}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    audience: event.target.value as DraftNotification["audience"],
                    roleScope:
                      event.target.value === "ROLE" ? current.roleScope : "USER",
                  }))
                }
                className="h-11 rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              >
                {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Role cible</span>
              <select
                value={draft.roleScope}
                disabled={draft.audience !== "ROLE"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    roleScope: event.target.value as DraftNotification["roleScope"],
                  }))
                }
                className="h-11 rounded-xl border border-border/70 bg-background px-4 text-sm outline-none transition-colors focus:border-primary disabled:opacity-50"
              >
                <option value="USER">USER</option>
                <option value="CLUB">CLUB</option>
                <option value="BUREAU">BUREAU</option>
                <option value="ENTRAINEUR">ENTRAINEUR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {composeRoleError ? (
                <span className="text-sm font-medium text-destructive">
                  Le role cible est obligatoire.
                </span>
              ) : null}
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              La notification sera publiee tout de suite dans la cloche et
              l&apos;historique des utilisateurs vises.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isCreating}
                onClick={() => {
                  setDraft(EMPTY_DRAFT);
                  setPublishAttempted(false);
                }}
              >
                Reinitialiser
              </Button>
              <Button
                type="button"
                disabled={isCreating}
                onClick={() => void createNotification()}
              >
                {isCreating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isCreating ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher titre, contenu, type..."
              className="h-10 w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "AUTO", "MANUAL", "IMPORTANT"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filter === value ? "default" : "outline"}
                onClick={() => setFilter(value)}
              >
                {value === "ALL"
                  ? "Toutes"
                  : value === "AUTO"
                    ? "Automatiques"
                    : value === "MANUAL"
                      ? "Manuelles"
                      : "Importantes"}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => void refreshNotifications()}
            >
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Chargement des notifications...
          </CardContent>
        </Card>
      ) : loadError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">
            {loadError}
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="font-medium text-foreground">
              Aucune notification ne correspond au filtre.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Essaie un autre filtre ou une recherche plus large.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className="border-border bg-card shadow-sm transition-colors duration-200 hover:shadow-md"
            >
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">
                        {notification.title}
                      </CardTitle>
                      <Badge variant="secondary">
                        {TYPE_LABELS[notification.type]}
                      </Badge>
                      <Badge variant="outline">
                        {AUDIENCE_LABELS[notification.audience]}
                      </Badge>
                      {notification.roleScope ? (
                        <Badge variant="outline">{notification.roleScope}</Badge>
                      ) : null}
                      {["HIGH", "URGENT"].includes(notification.priority) ? (
                        <Badge>Important</Badge>
                      ) : null}
                    </div>
                    <CardDescription>
                      {notification.createdByUser?.name ||
                        notification.createdByUser?.email ||
                        "Automatisation"}{" "}
                      | {formatDateTime(notification.publishedAt)} | source{" "}
                      {notification.sourceKind}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {notification._count.reads} lecture
                      {notification._count.reads > 1 ? "s" : ""}
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isRepublishingId === notification.id}
                      onClick={() => void republishNotification(notification.id)}
                    >
                      {isRepublishingId === notification.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Republier
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditAttempted(false);
                        setEditing(notification);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Corriger
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingNotification(notification)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {notification.content}
                </p>

                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="font-medium text-foreground">Priorite</p>
                    <p>{notification.priority}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Lien</p>
                    <p>{notification.href || "Aucun lien"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Source ID</p>
                    <p>{notification.sourceId || "Aucun"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Expiration</p>
                    <p>
                      {notification.expiresAt
                        ? formatDateTime(notification.expiresAt)
                        : "Aucune"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {toast ? (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full px-4 py-3 text-sm shadow-lg ${
            toast.tone === "success"
              ? "bg-emerald-600 text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Corriger une notification</DialogTitle>
            <DialogDescription>
              Ajuste le message diffuse sans toucher a la source editoriale si
              besoin.
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="grid gap-4 py-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Titre</span>
                <input
                  className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                  value={editing.title}
                  onChange={(event) =>
                    setEditing({ ...editing, title: event.target.value })
                  }
                />
                {editTitleError ? (
                  <span className="text-sm font-medium text-destructive">
                    Le titre est obligatoire.
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Contenu</span>
                <textarea
                  className="min-h-32 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                  value={editing.content}
                  onChange={(event) =>
                    setEditing({ ...editing, content: event.target.value })
                  }
                />
                {editContentError ? (
                  <span className="text-sm font-medium text-destructive">
                    Le contenu est obligatoire.
                  </span>
                ) : null}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Lien</span>
                  <input
                    className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                    value={editing.href ?? ""}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        href: event.target.value || null,
                      })
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">Priorite</span>
                  <select
                    className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                    value={editing.priority}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        priority: event.target.value as NotificationItem["priority"],
                      })
                    }
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">Audience</span>
                  <select
                    className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                    value={editing.audience}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        audience: event.target.value as NotificationItem["audience"],
                        roleScope:
                          event.target.value === "ROLE"
                            ? editing.roleScope ?? "USER"
                            : null,
                      })
                    }
                  >
                    {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">Role cible</span>
                  <select
                    className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                    disabled={editing.audience !== "ROLE"}
                    value={editing.roleScope ?? "USER"}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        roleScope: event.target.value as NonNullable<
                          NotificationItem["roleScope"]
                        >,
                      })
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="CLUB">CLUB</option>
                    <option value="BUREAU">BUREAU</option>
                    <option value="ENTRAINEUR">ENTRAINEUR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void saveEdit()}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingNotification)}
        onOpenChange={(open) => !open && setDeletingNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette notification ?</DialogTitle>
            <DialogDescription>
              Elle disparaitra du flux utilisateur, sans supprimer
              necessairement la source editoriale d&apos;origine.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deletingId === deletingNotification?.id}
              onClick={() =>
                deletingNotification
                  ? void deleteNotification(deletingNotification.id)
                  : undefined
              }
            >
              {deletingId === deletingNotification?.id
                ? "Suppression..."
                : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
