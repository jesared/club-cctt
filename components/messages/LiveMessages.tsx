"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
  author: {
    name: string;
  };
};

export default function LiveMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 🔹 charge les messages
  async function loadMessages() {
    const res = await fetch("/api/messages", { cache: "no-store" });
    const data = await res.json();
    setMessages(data);
    setLoaded(true);
  }

  // 🔹 marque un message comme lu
  async function markAsRead(id: string) {
    await fetch("/api/messages/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId: id }),
    });
  }

  // 📥 Chargement initial + refresh
  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 20000); // toutes les 20s
    return () => clearInterval(interval);
  }, []);

  // 👁️ Marquage lu uniquement quand les messages changent
  useEffect(() => {
    if (!loaded) return;

    messages.forEach((m) => {
      markAsRead(m.id);
    });
  }, [messages, loaded]);

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`border rounded-lg p-4 transition ${
            m.important
              ? "border-primary/60 bg-primary/10"
              : "border-border bg-card"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{m.title}</h3>

            {m.important && (
              <span className="text-xs font-bold text-primary">IMPORTANT</span>
            )}
          </div>

          <p className="text-muted-foreground whitespace-pre-line">{m.content}</p>

          <p className="text-xs text-muted-foreground mt-2">
            {m.author?.name ?? "Club"} —{" "}
            {new Date(m.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
      ))}
    </div>
  );
}
