import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          CCTT
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/club">Le club</Link>
          <Link href="/horaires">Horaires</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href="/partenaires">Partenaires</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
