export default function ClubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Le Club</h1>
      <section className="bg-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h3>Présentation</h3>
          Fondé à Châlons-en-Champagne, le CCTT est un club affilié à la
          Fédération Française de Tennis de Table. Le club a pour objectif de
          promouvoir la pratique du tennis de table, aussi bien en loisir qu’en
          compétition, dans un esprit de respect, de convivialité et de
          progression.
        </div>
      </section>
      <h3>Nos valeurs</h3>
      <ul className="space-y-3">
        <li>Accessibilité à tous les publics</li>
        <li>Convivialité et esprit d’équipe</li>
        <li>Encadrement sérieux</li>
        <li>Respect et fair-play</li>
      </ul>
    </div>
  );
}
