import { auth } from "@/auth";
import LiveMessages from "@/components/messages/LiveMessages";
import Link from "next/link";
import { redirect } from "next/navigation";

type Message = {
  id: string;
  content: string;
  important: boolean;
  createdAt: string;
  author: {
    name: string | null;
  };
};

async function getMessages(): Promise<Message[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/messages`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

function formatDate(date: string | undefined) {
  if (!date) return "Pas encore de publication";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function EspacePage() {
  const session = await auth();

  // 🔒 pas connecté → dehors
  if (!session) redirect("/");

  const messages = await getMessages();
  const importantCount = messages.filter((message) => message.important).length;
  const latestMessage = messages[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold">Espace licencié</h1>
        <p className="text-gray-600">
          Retrouvez les infos clés du club et des suggestions d&apos;actions pour ne
          rien manquer de la vie de l&apos;association.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Messages publiés</p>
          <p className="mt-2 text-3xl font-semibold">{messages.length}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Alertes importantes</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">{importantCount}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Dernière publication</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(latestMessage?.createdAt)}</p>
        </article>
      </section>

      <section className="rounded-xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="text-xl font-semibold text-blue-900">Nos suggestions pour vous</h2>
        <ul className="mt-4 space-y-3 text-blue-900">
          <li>✅ Consultez les messages importants en priorité pour les convocations.</li>
          <li>🏓 Vérifiez les horaires chaque semaine avant l&apos;entraînement.</li>
          <li>📅 Anticipez votre inscription au tournoi pour garantir votre place.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/horaires"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Voir les horaires
          </Link>
          <Link
            href="/tournoi/inscription"
            className="rounded-lg border border-blue-700 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100"
          >
            M&apos;inscrire au tournoi
          </Link>
        </div>
      </section>

      <LiveMessages />
    </div>
  );
}
