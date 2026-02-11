"use client";

import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

type Message = {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
  author: {
    name: string | null;
    email: string | null;
  };
};

export default function AdminMessagesPage() {
  /* ----------- FORMULAIRE CREATION ----------- */

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ----------- LISTE MESSAGES ----------- */

  const [messages, setMessages] = useState<Message[]>([]);
  const [editing, setEditing] = useState<Message | null>(null);

  /* ----------- CHARGEMENT ----------- */

  async function loadMessages() {
    const res = await fetch("/api/messages/admin");
    const data = await res.json();
    setMessages(data);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  /* ----------- CREATION ----------- */

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    setLoading(true);

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
        }),
      });

      if (!res.ok) throw new Error();

      setTitle("");
      setContent("");
      setImportant(false);

      await loadMessages();

      alert("Message publié !");
    } catch {
      alert("Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  }

  /* ----------- SUPPRESSION ----------- */

  async function deleteMessage(id: string) {
    if (!confirm("Supprimer ce message ?")) return;

    await fetch(`/api/messages/delete/${id}`, {
      method: "DELETE",
    });

    loadMessages();
  }

  /* ================= RENDER ================= */

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-12">
      {/* ================= CREATION ================= */}

      <div>
        <h1 className="text-2xl font-bold mb-6">
          Publier une information club
        </h1>

        <form onSubmit={submit} className="space-y-4">
          {/* TITRE */}
          <input
            className="w-full border rounded p-3"
            placeholder="Titre du message (ex: Entraînement annulé mercredi)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* MESSAGE */}
          <textarea
            className="w-full border rounded p-3"
            rows={6}
            placeholder="Contenu du message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
            />
            Message important (épinglé)
          </label>

          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Publication..." : "Publier"}
          </button>
        </form>
      </div>

      {/* ================= LISTE ================= */}

      <div>
        <h2 className="text-xl font-semibold mb-4">Messages publiés</h2>

        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`border rounded-lg p-4 ${
                m.important
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{m.title}</h3>

                  <p className="text-gray-700 whitespace-pre-wrap">
                    {m.content}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {m.author?.name || m.author?.email} —{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 min-w-[120px]">
                  <button
                    onClick={() => setEditing(m)}
                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 hover:border-blue-300"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 hover:border-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL EDITION ================= */}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-semibold">Modifier le message</h2>

            <input
              className="w-full border rounded p-2"
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
            />

            <textarea
              className="w-full border rounded p-2"
              rows={5}
              value={editing.content}
              onChange={(e) =>
                setEditing({ ...editing, content: e.target.value })
              }
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.important}
                onChange={(e) =>
                  setEditing({ ...editing, important: e.target.checked })
                }
              />
              Message important
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="border px-4 py-2 rounded"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  await fetch("/api/messages/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editing),
                  });

                  setEditing(null);
                  loadMessages();
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
