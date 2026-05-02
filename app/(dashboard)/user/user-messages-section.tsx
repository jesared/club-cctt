"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UserMessage = {
  id: string;
  title: string;
  content: string;
  important: boolean;
  formattedDate: string;
  authorName: string | null;
  authorEmail: string | null;
  isUnread: boolean;
};

const INITIAL_VISIBLE_MESSAGES = 3;

export default function UserMessagesSection({
  messages,
  canMarkAsRead,
}: {
  messages: UserMessage[];
  canMarkAsRead: boolean;
}) {
  const [openMessageIds, setOpenMessageIds] = useState<string[]>([]);
  const [readMessageIds, setReadMessageIds] = useState<string[]>(
    messages.filter((message) => !message.isUnread).map((message) => message.id),
  );
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);
  const [showAllMessages, setShowAllMessages] = useState(false);

  const readMessageIdSet = useMemo(
    () => new Set(readMessageIds),
    [readMessageIds],
  );

  function toggleMessage(messageId: string) {
    setOpenMessageIds((current) =>
      current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : [...current, messageId],
    );
  }

  async function markMessageAsRead(message: UserMessage) {
    if (
      !canMarkAsRead ||
      readMessageIdSet.has(message.id) ||
      pendingReadId === message.id
    ) {
      return;
    }

    setPendingReadId(message.id);

    try {
      const response = await fetch("/api/messages/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId: message.id }),
      });

      if (!response.ok) {
        throw new Error("Unable to mark message as read.");
      }

      setReadMessageIds((current) =>
        current.includes(message.id) ? current : [...current, message.id],
      );
    } catch {
      // Keep the unread badge if the request fails.
    } finally {
      setPendingReadId((current) => (current === message.id ? null : current));
    }
  }

  function toggleMessageAndMaybeRead(message: UserMessage) {
    const isOpen = openMessageIds.includes(message.id);

    if (isOpen) {
      toggleMessage(message.id);
      return;
    }

    toggleMessage(message.id);
  }

  if (messages.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="font-medium text-foreground">
            Aucun message du club pour le moment.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les prochaines annonces apparaitront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const visibleMessages = showAllMessages
    ? messages
    : messages.slice(0, INITIAL_VISIBLE_MESSAGES);
  const hiddenMessagesCount = Math.max(
    messages.length - INITIAL_VISIBLE_MESSAGES,
    0,
  );

  return (
    <div className="grid gap-4">
      {visibleMessages.map((message) => {
        const isOpen = openMessageIds.includes(message.id);
        const isUnread = canMarkAsRead && !readMessageIdSet.has(message.id);
        const preview =
          message.content.length > 220
            ? `${message.content.slice(0, 220).trimEnd()}...`
            : message.content;

        return (
          <Card
            key={message.id}
            className={
              message.important ? "border-primary/40 bg-primary/5" : undefined
            }
          >
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{message.title}</CardTitle>
                    {message.important ? <Badge>Important</Badge> : null}
                    {isUnread ? (
                      <Badge variant="secondary">Nouveau</Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    {message.authorName || message.authorEmail || "Club"} |{" "}
                    {message.formattedDate}
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-expanded={isOpen}
                  onClick={() => toggleMessageAndMaybeRead(message)}
                >
                  {isOpen ? "Reduire" : "Afficher"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {isOpen ? message.content : preview}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isUnread ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pendingReadId === message.id}
                    onClick={() => void markMessageAsRead(message)}
                  >
                    {pendingReadId === message.id
                      ? "Mise a jour..."
                      : "Marquer comme lu"}
                  </Button>
                ) : (
                  <Badge variant="outline">Lu</Badge>
                )}

                {isOpen ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleMessage(message.id)}
                  >
                    Reduire
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {hiddenMessagesCount > 0 ? (
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAllMessages((current) => !current)}
          >
            {showAllMessages
              ? "Afficher moins de messages"
              : `Afficher ${hiddenMessagesCount} message${
                  hiddenMessagesCount > 1 ? "s" : ""
                } de plus`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
