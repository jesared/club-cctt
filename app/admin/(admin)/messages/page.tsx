"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Search,
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

type Message = {
  id: string;
  title: string;
  content: string;
  important: boolean;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  author: {
    name: string | null;
    email: string | null;
  };
};

type ToastState = {
  tone: "success" | "error";
  message: string;
};

type MessageStatus = "DRAFT" | "PUBLISHED";
type MessageFilter = "ALL" | "PUBLISHED" | "DRAFT" | "IMPORTANT";

export default function AdminMessagesPage() {
  const composeCardRef = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const [publishAttempted, setPublishAttempted] = useState(false);
  const [isPublishing, setIsPublishing] = useState<MessageStatus | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [messagesLoadError, setMessagesLoadError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [editing, setEditing] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [editAttempted, setEditAttempted] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageFilter, setMessageFilter] = useState<MessageFilter>("ALL");
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const titleError = publishAttempted && !trimmedTitle;
  const contentError = publishAttempted && !trimmedContent;
  const editTitleError = editAttempted && !!editing && !editing.title.trim();
  const editContentError =
    editAttempted && !!editing && !editing.content.trim();

  const importantCount = useMemo(
    () => messages.filter((message) => message.important).length,
    [messages],
  );
  const publishedCount = useMemo(
    () => messages.filter((message) => message.status === "PUBLISHED").length,
    [messages],
  );
  const draftCount = messages.length - publishedCount;
  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return messages
      .filter((message) => {
        const matchesFilter =
          messageFilter === "ALL"
            ? true
            : messageFilter === "PUBLISHED"
              ? message.status === "PUBLISHED"
              : messageFilter === "DRAFT"
                ? message.status === "DRAFT"
                : messageFilter === "IMPORTANT"
              ? message.important
              : true;

        const matchesSearch = normalizedSearch
          ? `${message.title} ${message.content}`
              .toLowerCase()
              .includes(normalizedSearch)
          : true;

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (a.important !== b.important) {
          return a.important ? -1 : 1;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [messageFilter, messages, searchTerm]);

  async function loadMessages() {
    setMessagesLoadError(null);

    const res = await fetch("/api/messages/admin");
    if (!res.ok) {
      throw new Error(
        await getResponseErrorMessage(
          res,
          "Impossible de charger les messages",
        ),
      );
    }

    const data = await res.json();
    setMessages(data);
  }

  const refreshMessages = useCallback(async () => {
    setIsLoadingMessages(true);

    try {
      await loadMessages();
    } catch {
      setMessagesLoadError(
        "Impossible de charger les messages pour le moment.",
      );
      showToast("error", "Impossible de charger les messages pour le moment.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void refreshMessages();
  }, [refreshMessages]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  function showToast(tone: ToastState["tone"], message: string) {
    setToast({ tone, message });
  }

  function openEditor(message: Message) {
    setEditAttempted(false);
    setEditing(message);
  }

  function openDeleteDialog(message: Message) {
    setDeletingMessage(message);
  }

  async function submitMessage(status: MessageStatus) {
    setPublishAttempted(true);

    if (!trimmedTitle || !trimmedContent) return;

    setIsPublishing(status);

    try {
      const res = await fetch("/api/messages/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          important,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error(
          await getResponseErrorMessage(
            res,
            status === "DRAFT"
              ? "Erreur lors de l'enregistrement du brouillon."
              : "Erreur lors de la publication du message.",
          ),
        );
      }

      setTitle("");
      setContent("");
      setImportant(false);
      setPublishAttempted(false);

      await refreshMessages();
      showToast(
        "success",
        status === "DRAFT" ? "Brouillon enregistre." : "Message publie.",
      );
    } catch (error) {
      const fallback =
        status === "DRAFT"
          ? "Erreur lors de l'enregistrement du brouillon."
          : "Erreur lors de la publication du message.";

      showToast(
        "error",
        error instanceof Error && error.message ? error.message : fallback,
      );
    } finally {
      setIsPublishing(null);
    }
  }

  async function deleteMessage(id: string) {
    setDeletingId(id);

    try {
      const res = await fetch(`/api/messages/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(
          await getResponseErrorMessage(
            res,
            "Erreur lors de la suppression du message.",
          ),
        );
      }

      await refreshMessages();
      setDeletingMessage(null);
      showToast("success", "Message supprime.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de la suppression du message.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function saveEdit() {
    if (!editing) return;

    setEditAttempted(true);

    if (!editing.title.trim() || !editing.content.trim()) {
      return;
    }

    setSavingEdit(true);

    try {
      const res = await fetch("/api/messages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) {
        throw new Error(
          await getResponseErrorMessage(res, "Erreur lors de la mise a jour."),
        );
      }

      setEditAttempted(false);
      setEditing(null);
      await refreshMessages();
      showToast(
        "success",
        editing.status === "DRAFT"
          ? "Brouillon mis a jour."
          : "Message mis a jour.",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error && error.message
          ? error.message
          : "Erreur lors de la mise a jour.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
        <CardHeader className="gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Administration
            </p>
            <CardTitle className="text-3xl">
              Messages et informations club
            </CardTitle>
          </div>
          <CardDescription className="max-w-3xl text-sm leading-6">
            Publie les annonces du club, mets en avant les informations
            importantes et garde un historique propre des communications
            visibles par les membres.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Messages"
          value={messages.length}
          helper="tous statuts confondus"
        />
        <MetricCard
          label="Publies"
          value={publishedCount}
          helper="visibles par les membres"
        />
        <MetricCard
          label="Brouillons"
          value={draftCount}
          helper="non encore visibles"
        />
        <MetricCard
          label="Importants"
          value={importantCount}
          helper="messages epingles"
        />
      </div>

      <Card className="admin-form-card">
        <div ref={composeCardRef} />
        <CardHeader className="admin-form-header">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-primary" />
            Publier une information club
          </CardTitle>
          <CardDescription>
            Redige une annonce claire. Les messages importants sont mis en avant
            dans l&apos;espace membre.
          </CardDescription>
        </CardHeader>

        <CardContent className="admin-form-content">
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
            className="contents"
          >
            <label className="admin-field-wide">
              <span className="admin-label">Titre</span>
              <input
                className="admin-input"
                required
                disabled={Boolean(isPublishing)}
                placeholder="Ex: Entrainement annule mercredi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={titleError}
                aria-describedby={
                  titleError
                    ? "message-title-help message-title-error"
                    : "message-title-help"
                }
              />
              <span
                id="message-title-help"
                className="text-sm text-muted-foreground"
              >
                Visible dans la liste des messages. Garde un titre court et
                explicite.
              </span>
              {titleError ? (
                <span
                  id="message-title-error"
                  className="text-sm font-medium text-destructive"
                >
                  Le titre est obligatoire.
                </span>
              ) : null}
            </label>

            <label className="admin-field-wide">
              <span className="admin-label">Contenu</span>
              <textarea
                className="admin-textarea"
                rows={6}
                required
                disabled={Boolean(isPublishing)}
                placeholder="Contenu du message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-invalid={contentError}
                aria-describedby={
                  contentError
                    ? "message-content-help message-content-error"
                    : "message-content-help"
                }
              />
              <span
                id="message-content-help"
                className="text-sm text-muted-foreground"
              >
                Ajoute le contexte utile, la date concernee et l&apos;action
                attendue si besoin.
              </span>
              {contentError ? (
                <span
                  id="message-content-error"
                  className="text-sm font-medium text-destructive"
                >
                  Le contenu du message est obligatoire.
                </span>
              ) : null}
            </label>

            <div className="admin-field-wide">
              <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 px-4 py-3">
                <input
                  type="checkbox"
                  checked={important}
                  disabled={Boolean(isPublishing)}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-foreground">
                    Marquer comme message important
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Le message sera visuellement mis en avant dans la liste.
                  </span>
                </span>
              </label>
            </div>

            <div className="admin-actions">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    Boolean(isPublishing) || !trimmedTitle || !trimmedContent
                  }
                  onClick={() => void submitMessage("DRAFT")}
                >
                  {isPublishing === "DRAFT" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isPublishing === "DRAFT"
                    ? "Enregistrement..."
                    : "Enregistrer le brouillon"}
                </Button>
                <Button
                  type="button"
                  disabled={
                    Boolean(isPublishing) || !trimmedTitle || !trimmedContent
                  }
                  onClick={() => void submitMessage("PUBLISHED")}
                >
                  {isPublishing === "PUBLISHED" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isPublishing === "PUBLISHED"
                    ? "Publication..."
                    : "Publier le message"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPublishing
                  ? "Publication en cours..."
                  : "Enregistre un brouillon pour y revenir plus tard, ou publie directement le message pour les membres."}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Messages</CardTitle>
              <CardDescription>
                Consulte les brouillons et les messages publies, modifie un
                contenu ou retire une annonce devenue obsolete.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <MessageCountBadge
                label="Tous"
                value={messages.length}
                active={messageFilter === "ALL"}
              />
              <MessageCountBadge
                label="Publies"
                value={publishedCount}
                active={messageFilter === "PUBLISHED"}
              />
              <MessageCountBadge
                label="Brouillons"
                value={draftCount}
                active={messageFilter === "DRAFT"}
              />
              <MessageCountBadge
                label="Importants"
                value={importantCount}
                active={messageFilter === "IMPORTANT"}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="grid gap-2">
              <span className="admin-label">Recherche</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  className="admin-input h-10 pl-9"
                  placeholder="Rechercher par titre ou contenu"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Rechercher un message"
                />
              </div>
            </label>

            <div className="grid gap-2">
              <span className="admin-label">Filtre</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={messageFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setMessageFilter("ALL")}
                >
                  Tous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={messageFilter === "PUBLISHED" ? "default" : "outline"}
                  onClick={() => setMessageFilter("PUBLISHED")}
                >
                  Publies
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={messageFilter === "DRAFT" ? "default" : "outline"}
                  onClick={() => setMessageFilter("DRAFT")}
                >
                  Brouillons
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={messageFilter === "IMPORTANT" ? "default" : "outline"}
                  onClick={() => setMessageFilter("IMPORTANT")}
                >
                  Importants
                </Button>
              </div>
            </div>
          </div>

          {isLoadingMessages ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-10 text-center">
              <p className="font-medium text-foreground">
                Chargement des messages...
              </p>
            </div>
          ) : messagesLoadError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/6 px-6 py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    La liste des messages n&apos;a pas pu etre chargee.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verifie la connexion ou reessaie dans quelques instants.
                  </p>
                </div>
                <Button variant="outline" onClick={() => void refreshMessages()}>
                  Reessayer
                </Button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-10 text-center">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Aucun message publie pour le moment.
                </p>
                <p className="text-sm text-muted-foreground">
                  Utilise le formulaire ci-dessus pour publier la premiere
                  information du club.
                </p>
              </div>
              <div className="mt-5">
                <Button
                  type="button"
                  onClick={() => {
                    composeCardRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Publier le premier message
                </Button>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-10 text-center">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Aucun message ne correspond a cette recherche.
                </p>
                <p className="text-sm text-muted-foreground">
                  Essaie un autre mot-cle ou change le filtre actif.
                </p>
              </div>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <article
                key={message.id}
                aria-busy={deletingId === message.id}
                className={`rounded-2xl border p-5 shadow-xs transition-colors ${
                  message.important
                    ? "border-primary/40 bg-primary/8 ring-1 ring-primary/10"
                    : "border-border/70 bg-background/80"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {message.title}
                      </h3>
                      <Badge
                        variant={
                          message.status === "PUBLISHED" ? "default" : "outline"
                        }
                        className="rounded-full px-2.5 py-1"
                      >
                        {message.status === "PUBLISHED"
                          ? "Publie"
                          : "Brouillon"}
                      </Badge>
                      {message.important ? (
                        <Badge className="rounded-full px-2.5 py-1">
                          <Pin className="mr-1 h-3.5 w-3.5" />
                          Important
                        </Badge>
                      ) : null}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {message.content}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {message.author?.name || message.author?.email} ·{" "}
                      {formatDateTime(message.createdAt)}
                    </p>

                    {message.important ? (
                      <p className="text-xs font-medium text-primary">
                        Mis en avant dans la liste des informations club.
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0">
                    <div className="flex flex-col gap-2 sm:hidden">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={deletingId === message.id}
                        onClick={() => openEditor(message)}
                      >
                        {deletingId === message.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                        Modifier
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        disabled={deletingId === message.id}
                        onClick={() => openDeleteDialog(message)}
                      >
                        {deletingId === message.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {deletingId === message.id
                          ? "Suppression..."
                          : "Supprimer"}
                      </Button>

                      {deletingId === message.id ? (
                        <p
                          className="text-xs font-medium text-muted-foreground"
                          role="status"
                          aria-live="polite"
                        >
                          Suppression en cours...
                        </p>
                      ) : null}
                    </div>

                    <div className="hidden flex-col items-end gap-2 sm:flex">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Modifier le message"
                          title="Modifier le message"
                          disabled={deletingId === message.id}
                          onClick={() => openEditor(message)}
                        >
                          {deletingId === message.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label={
                            deletingId === message.id
                              ? "Suppression du message"
                              : "Supprimer le message"
                          }
                          title={
                            deletingId === message.id
                              ? "Suppression..."
                              : "Supprimer le message"
                          }
                          disabled={deletingId === message.id}
                          onClick={() => openDeleteDialog(message)}
                        >
                          {deletingId === message.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {deletingId === message.id ? (
                        <p
                          className="text-xs font-medium text-muted-foreground"
                          role="status"
                          aria-live="polite"
                        >
                          Suppression en cours...
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      {deletingMessage ? (
        <Dialog
          open={Boolean(deletingMessage)}
          onOpenChange={(open) => {
            if (!open && !deletingId) {
              setDeletingMessage(null);
            }
          }}
        >
          <DialogContent
            className="max-w-md overflow-hidden border-destructive/20 p-0"
            aria-busy={deletingId === deletingMessage.id}
          >
            <DialogHeader className="border-b border-destructive/10 bg-gradient-to-br from-destructive/8 via-card to-card px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <DialogTitle className="text-xl">
                    Supprimer ce message ?
                  </DialogTitle>
                  <DialogDescription className="leading-6">
                    Cette action est definitive. Le message sera retire de
                    l&apos;administration et ne sera plus visible par les
                    membres.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      deletingMessage.status === "PUBLISHED"
                        ? "default"
                        : "outline"
                    }
                    className="rounded-full px-2.5 py-1"
                  >
                    {deletingMessage.status === "PUBLISHED"
                      ? "Publie"
                      : "Brouillon"}
                  </Badge>
                  {deletingMessage.important ? (
                    <Badge className="rounded-full px-2.5 py-1">
                      <Pin className="mr-1 h-3.5 w-3.5" />
                      Important
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-base font-semibold text-foreground">
                  {deletingMessage.title}
                </p>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {deletingMessage.content}
                </p>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                Verifie bien que cette annonce n&apos;est plus utile avant de
                confirmer la suppression.
              </p>
            </div>

            <DialogFooter className="border-t border-border/60 px-6 py-5 sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {deletingId === deletingMessage.id
                  ? "Suppression en cours..."
                  : "Cette action est irreversible."}
              </p>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={deletingId === deletingMessage.id}
                >
                  Annuler
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={deletingId === deletingMessage.id}
                onClick={() => void deleteMessage(deletingMessage.id)}
              >
                {deletingId === deletingMessage.id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deletingId === deletingMessage.id
                  ? "Suppression..."
                  : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {editing ? (
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open && !savingEdit) {
              setEditAttempted(false);
              setEditing(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl p-0" aria-busy={savingEdit}>
            <DialogHeader className="border-b border-border/60 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DialogTitle className="text-xl">
                    Modifier le message
                  </DialogTitle>
                  <DialogDescription>
                    Mets a jour le contenu puis enregistre les changements.
                  </DialogDescription>
                </div>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Fermer la modale"
                    disabled={savingEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>

            <CardContent className="grid gap-5 p-6">
              <label className="admin-field">
                <span className="admin-label">Titre</span>
                <input
                  className="admin-input"
                  required
                  disabled={savingEdit}
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  aria-invalid={editTitleError}
                  aria-describedby={
                    editTitleError
                      ? "edit-message-title-help edit-message-title-error"
                      : "edit-message-title-help"
                  }
                />
                <span
                  id="edit-message-title-help"
                  className="text-sm text-muted-foreground"
                >
                  Mets a jour le titre visible dans la liste des messages.
                </span>
                {editTitleError ? (
                  <span
                    id="edit-message-title-error"
                    className="text-sm font-medium text-destructive"
                  >
                    Le titre est obligatoire.
                  </span>
                ) : null}
              </label>

              <label className="admin-field">
                <span className="admin-label">Contenu</span>
                <textarea
                  className="admin-textarea"
                  rows={6}
                  required
                  disabled={savingEdit}
                  value={editing.content}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                  aria-invalid={editContentError}
                  aria-describedby={
                    editContentError
                      ? "edit-message-content-help edit-message-content-error"
                      : "edit-message-content-help"
                  }
                />
                <span
                  id="edit-message-content-help"
                  className="text-sm text-muted-foreground"
                >
                  Verifie les dates, le lieu et les consignes avant
                  enregistrement.
                </span>
                {editContentError ? (
                  <span
                    id="edit-message-content-error"
                    className="text-sm font-medium text-destructive"
                  >
                    Le contenu du message est obligatoire.
                  </span>
                ) : null}
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 px-4 py-3">
                <input
                  type="checkbox"
                  checked={editing.important}
                  disabled={savingEdit}
                  onChange={(e) =>
                    setEditing({ ...editing, important: e.target.checked })
                  }
                  className="mt-1 h-4 w-4"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-foreground">
                    Conserver comme message important
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Active cette option pour laisser le message mis en avant.
                  </span>
                </span>
              </label>

              <div className="grid gap-2">
                <span className="admin-label">Statut</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      editing.status === "DRAFT" ? "secondary" : "outline"
                    }
                    disabled={savingEdit}
                    onClick={() =>
                      setEditing({ ...editing, status: "DRAFT" })
                    }
                  >
                    Brouillon
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      editing.status === "PUBLISHED" ? "default" : "outline"
                    }
                    disabled={savingEdit}
                    onClick={() =>
                      setEditing({ ...editing, status: "PUBLISHED" })
                    }
                  >
                    Publie
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {editing.status === "DRAFT"
                    ? "Le message reste visible uniquement dans l'administration."
                    : "Le message sera visible dans l'espace membre."}
                </p>
              </div>
            </CardContent>

            <DialogFooter className="border-t border-border/60 px-6 py-5 sm:items-center sm:justify-between">
              <p
                className="text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {savingEdit
                  ? "Enregistrement en cours..."
                  : editTitleError || editContentError
                    ? "Le titre et le contenu sont obligatoires."
                    : "Les changements seront visibles apres validation."}
              </p>
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <DialogClose asChild>
                  <Button variant="outline" disabled={savingEdit}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button onClick={saveEdit} disabled={savingEdit}>
                  {savingEdit ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  {savingEdit ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {toast ? (
        <div
          className={`fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.tone === "success"
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <Card className="border-border/70 bg-card/95 shadow-xs [background-image:none]">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function MessageCountBadge({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className="rounded-full px-3 py-1"
    >
      {label} · {value}
    </Badge>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function getResponseErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload?.error) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parsing errors and use the fallback message.
  }

  return fallback;
}
