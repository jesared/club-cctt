export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
      {/* TITRE PAGE */}
      <header>
        <h1 className="text-4xl font-bold mb-4">Contact</h1>
        <p className="text-gray-600 max-w-3xl">
          Pour toute demande d’information, inscription ou partenariat,
          n’hésitez pas à nous contacter.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* INFORMATIONS */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Coordonnées du club</h2>

          <ul className="space-y-4 text-gray-700">
            <li>
              <strong>Club :</strong> Châlons-en-Champagne Tennis de Table
            </li>
            <li>
              <strong>Email :</strong>{" "}
              <a
                href="mailto:contact@cctt.fr"
                className="text-purple-600 hover:underline"
              >
                contact@cctt.fr
              </a>
            </li>
            <li>
              <strong>Lieu :</strong> Gymnase de Châlons-en-Champagne
            </li>
          </ul>

          <p className="mt-6 text-gray-600 max-w-md">
            Nous nous efforçons de répondre dans les meilleurs délais.
          </p>
        </section>

        {/* FORMULAIRE */}
        <section className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Formulaire de contact</h2>

          <form className="space-y-6">
            {/* NOM */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* BOUTON */}
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
            >
              Envoyer le message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
