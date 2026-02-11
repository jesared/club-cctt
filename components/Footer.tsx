export default function Footer() {
  const socialButtons = [
    {
      name: "Facebook",
      handle: "@chalonstt51",
      href: "https://www.facebook.com/chalonstt51",
      className:
        "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
      icon: (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.85c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      handle: "@chalonstt51",
      href: "https://www.instagram.com/chalonstt51/",
      className:
        "border-pink-200 bg-pink-50 text-pink-700 hover:border-pink-300 hover:bg-pink-100",
      icon: (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm11 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
      ),
    },
  ];

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
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {socialButtons.map((socialButton) => (
                <a
                  key={socialButton.name}
                  className={`inline-flex items-center justify-between rounded-lg border px-4 py-2 font-medium transition-colors ${socialButton.className}`}
                  href={socialButton.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="inline-flex items-center gap-2">
                    {socialButton.icon}
                    {socialButton.name}
                  </span>
                  <span className="text-xs opacity-90">{socialButton.handle}</span>
                </a>
              ))}
            </div>
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
