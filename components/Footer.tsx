export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold text-gray-800">
              Châlons-en-Champagne Tennis de Table
            </p>
            <p className="mt-3 text-sm text-gray-700">Salle Tirlet</p>
            <p>51000 Châlons-en-Champagne</p>
            <a
              className="mt-2 inline-flex items-center text-sm text-blue-700 hover:text-blue-800"
              href="https://maps.google.com/?q=Salle%20Tirlet%20Ch%C3%A2lons-en-Champagne"
              rel="noreferrer"
              target="_blank"
            >
              Itinéraire sur Google Maps
            </a>
          </div>

          <div>
            <p className="font-semibold text-gray-800">Infos pratiques</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>Entraînements : mar. & jeu. 18h30 - 21h</li>
              <li>Accueil licenciés : mer. 17h - 19h</li>
              <li>
                Contact :
                <a
                  className="ml-1 text-blue-700 hover:text-blue-800"
                  href="mailto:communication@cctt.fr"
                >
                  communication@cctt.fr
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-800">Liens utiles</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="text-gray-700 hover:text-gray-900" href="/actus">
                  Actualités
                </a>
              </li>
              <li>
                <a className="text-gray-700 hover:text-gray-900" href="/contact">
                  Contact
                </a>
              </li>
              <li>
                <a
                  className="text-gray-700 hover:text-gray-900"
                  href="https://cd51tt.fr/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Comité Marne TT
                </a>
              </li>
              <li>
                <a
                  className="text-gray-700 hover:text-gray-900"
                  href="https://www.fftt.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  Fédération Française de Tennis de Table
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-800">Suivez-nous</p>
            <p className="mt-3 text-sm text-gray-700">
              Rejoignez-nous sur nos réseaux pour suivre la vie du club,
              l&apos;actualité sportive et les prochains événements.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  className="text-gray-700 hover:text-gray-900"
                  href="https://www.facebook.com/chalonstt51"
                  rel="noreferrer"
                  target="_blank"
                >
                  Facebook (@chalonstt51)
                </a>
              </li>
              <li>
                <a
                  className="text-gray-700 hover:text-gray-900"
                  href="https://www.instagram.com/chalonstt51/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Instagram (@chalonstt51)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CCTT – Tous droits réservés</p>
          <div className="flex gap-4">
            <a className="hover:text-gray-700" href="/mentions-legales">
              Mentions légales
            </a>
            <a className="hover:text-gray-700" href="/politique-de-confidentialite">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
