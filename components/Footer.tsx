export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">
          Châlons-en-Champagne Tennis de Table
        </p>
        <p>Salle Tirlet – Châlons-en-Champagne</p>
        <p>Email : communication@cctt.fr</p>

        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} CCTT – Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
