import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";

const quickWins = [
  "Sécuriser les fallbacks de contenu (horaires/comité/partenaires).",
  "Clarifier le CTA d’inscription tournoi pour éviter l’ambiguïté.",
  "Renforcer la réassurance dans le formulaire d’inscription.",
  "Soigner les états vides avec messages et actions utiles.",
];

const structuralProjects = [
  "Refondre le tunnel d’inscription en parcours guidé.",
  "Mettre en place un suivi analytique de conversion bout en bout.",
  "Ajouter des relances automatiques pour dossiers incomplets et paiements en attente.",
  "Renforcer la résilience des données externes (fallbacks + monitoring).",
];

const plan30 = [
  "Corriger les fallbacks critiques pour éviter les pages cassées.",
  "Aligner le message et le CTA d’inscription sur une source unique.",
  "Optimiser les micro-textes du formulaire (délai, étapes, confirmations).",
  "Suivre les KPI de base: vues, clics, démarrages, soumissions.",
];

const plan60 = [
  "Instrumenter les étapes du tunnel et identifier les abandons majeurs.",
  "Lancer un A/B test simple sur les CTA d’inscription.",
  "Améliorer l’espace ‘Mes inscriptions’ (statuts et prochaines actions).",
  "Mettre en place des emails automatiques de relance.",
];

const plan90 = [
  "Créer des landing pages ciblées selon profils (jeunes/adultes/compétition).",
  "Déployer un rythme éditorial autour du tournoi et des preuves sociales.",
  "Installer une revue hebdomadaire du funnel orientée actions.",
];

export default async function AdminAuditUxPage() {
  await requireAdminSession();

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [views, clicks, starts, submits] = await Promise.all([
    prisma.kpiEvent.count({
      where: { eventType: "VIEW", createdAt: { gte: since } },
    }),
    prisma.kpiEvent.count({
      where: { eventType: "CLICK", createdAt: { gte: since } },
    }),
    prisma.kpiEvent.count({
      where: { eventType: "START", createdAt: { gte: since } },
    }),
    prisma.kpiEvent.count({
      where: { eventType: "SUBMIT", createdAt: { gte: since } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="mt-2 text-3xl font-bold">Audit UX & plan conversion inscriptions</h1>
        <p className="mt-3 text-muted-foreground">
          Synthèse opérationnelle: points forts, blocages UX, priorisation des améliorations
          et plan d’action à 30/60/90 jours pour augmenter les inscriptions.
        </p>
      </header>


      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">KPI essentiels (7 derniers jours)</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Indicateurs d&apos;activation du tunnel d&apos;inscription : vues, clics CTA, démarrages de formulaire et soumissions.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Vues</p>
            <p className="mt-2 text-3xl font-semibold">{views}</p>
          </article>
          <article className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Clics</p>
            <p className="mt-2 text-3xl font-semibold">{clicks}</p>
          </article>
          <article className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Démarrages</p>
            <p className="mt-2 text-3xl font-semibold">{starts}</p>
          </article>
          <article className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Soumissions</p>
            <p className="mt-2 text-3xl font-semibold">{submits}</p>
          </article>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">✅ Ce qui est clair</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Navigation globale lisible (club, tournoi, admin).</li>
            <li>Homepage avec proposition de valeur et CTA visibles.</li>
            <li>Tunnel tournoi globalement complet (info → inscription → suivi).</li>
            <li>APIs sécurisées (validation, anti-spam, rate limiting).</li>
          </ul>
        </article>

        <article className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">⚠️ Ce qui bloque</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Risque de page horaires cassée si la source externe échoue.</li>
            <li>Page comité fragile sans fallback local.</li>
            <li>Partenaires potentiellement vides en mode fallback.</li>
            <li>Parcours d’inscription ambigu entre interne et externe.</li>
          </ul>
        </article>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Priorisation des améliorations</h2>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <article>
            <h3 className="font-medium text-foreground">Quick wins (impact fort / effort faible)</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {quickWins.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article>
            <h3 className="font-medium text-foreground">
              Chantiers structurants (impact durable / effort moyen-fort)
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {structuralProjects.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Plan d’action concret 30 / 60 / 90 jours</h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border p-4">
            <h3 className="font-semibold">J+30</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {plan30.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border p-4">
            <h3 className="font-semibold">J+60</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {plan60.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border p-4">
            <h3 className="font-semibold">J+90</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {plan90.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
