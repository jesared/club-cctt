import { Badge } from "@/components/ui/badge";

export default function Footer() {
  const socialButtons = [
    {
      name: "Facebook",
      handle: "@chalonstt51",
      href: "https://www.facebook.com/chalonstt51",
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
      icon: (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm11 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="mt-12 border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Châlons-en-Champagne Tennis de Table</p>
            <p className="text-sm">Salle Tirlet</p>
            <p>51000 Châlons-en-Champagne</p>
            <a className="inline-flex text-sm text-primary hover:underline" href="https://maps.google.com/?q=Salle%20Tirlet%20Ch%C3%A2lons-en-Champagne" rel="noreferrer" target="_blank">Itinéraire sur Google Maps</a>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Infos pratiques</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Entraînements : mar. & jeu. 18h30 - 21h</li>
              <li>Accueil licenciés : mer. 17h - 19h</li>
              <li>
                Contact :
                <a className="ml-1 text-primary hover:underline" href="mailto:communication@cctt.fr">communication@cctt.fr</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Liens utiles</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="hover:text-foreground" href="/actus">Actualités</a></li>
              <li><a className="hover:text-foreground" href="/contact">Contact</a></li>
              <li><a className="hover:text-foreground" href="https://cd51tt.fr/" rel="noreferrer" target="_blank">Comité Marne TT</a></li>
              <li><a className="hover:text-foreground" href="https://www.fftt.com" rel="noreferrer" target="_blank">Fédération Française de Tennis de Table</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Suivez-nous</p>
            <p className="mt-3 text-sm">Rejoignez-nous sur nos réseaux pour suivre la vie du club.</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {socialButtons.map((socialButton) => (
                <a key={socialButton.href} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground" href={socialButton.href} rel="noreferrer" target="_blank">
                  {socialButton.icon}
                  {socialButton.handle}
                  <Badge variant="outline" className="ml-auto">{socialButton.name}</Badge>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-4 text-xs md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CCTT – Tous droits réservés</p>
          <div className="flex gap-4">
            <a className="hover:text-foreground" href="/mentions-legales">Mentions légales</a>
            <a className="hover:text-foreground" href="/politique-de-confidentialite">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
