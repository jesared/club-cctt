import { auth } from "@/auth";
import LiveMessages from "@/components/messages/LiveMessages";
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

export default async function EspacePage() {
  const session = await auth();

  // 🔒 pas connecté → dehors
  if (!session) redirect("/");

  const messages = await getMessages();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="text-4xl font-bold mb-2">Espace licencié</h1>
        <p className="text-gray-600">
          Retrouvez ici toutes les informations importantes du club.
        </p>
      </header>

      <LiveMessages />
    </div>
  );
}
