import ContactForm from "@/components/ContactForm";
import { ExternalMapLink } from "@/components/external-map-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClubContextNav from "@/components/public/club-context-nav";
import Reveal from "@/components/Reveal";
import { Mail, MapPin, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import {
  defaultContactContent,
  normalizeContactContent,
} from "@/lib/contact-content";
import {
  contactMotives,
  normalizeContactSubject,
} from "@/lib/contact-subjects";
import { prisma } from "@/lib/prisma";
import { getContactFormAvailability } from "@/lib/public-form-availability";

function buildMapDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ sujet?: string }>;
}) {
  const existing = await prisma.contactContent.findUnique({
    where: { id: "default" },
  });
  const content = normalizeContactContent(existing ?? defaultContactContent);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialSubject = normalizeContactSubject(resolvedSearchParams?.sujet);
  const contactAvailability = getContactFormAvailability();
  const mapQuery = [content.addressName, content.addressLine, content.addressCity]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
  const mapDirectionsUrl = mapQuery
    ? buildMapDirectionsUrl(mapQuery)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:py-12">
      <Reveal>
        <header className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#FF2E88]/40 bg-[#FF2E88]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-[#FF2E88] animate-fade-up-1">
            <Sparkles className="h-3.5 w-3.5" />
            {content.subtitle}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl animate-fade-up-2">
            {content.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
            {content.intro}
          </p>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <ClubContextNav />
      </Reveal>

      <Reveal delay={120}>
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Quel est votre besoin ?</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Choisissez le motif le plus proche de votre demande, puis utilisez
              le formulaire juste en dessous. Cela aide à entrer plus vite dans
              la bonne conversation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {contactMotives.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <Link
                  href={`/club/contact?sujet=${encodeURIComponent(item.title)}#contact-form`}
                  className="group block rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF2E88]/80 hover:bg-muted/30 hover:shadow-md"
                >
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                  <p className="mt-4 text-sm font-medium text-[#FF2E88]">
                    Contacter le club
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <section>
            <Card className="h-full border bg-background card-hover hover:border-[#FF2E88]/80">
              <CardHeader>
                <CardTitle className="text-2xl">Coordonnées du club</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Point de contact principal
                  </p>
                  <p className="mt-1 font-medium">{content.addressLine}</p>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Association sportive CCTT</p>
                    <p className="text-sm text-muted-foreground">
                      Club FFTT affilié, ouvert à tous les niveaux.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <a
                      href={`mailto:${content.email}`}
                      className="text-[#FF2E88] hover:underline"
                    >
                      {content.email}
                    </a>
                    <p className="text-sm text-muted-foreground">
                      {content.responseDelay}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    {mapDirectionsUrl ? (
                      <ExternalMapLink
                        href={mapDirectionsUrl}
                        label={content.addressName}
                        className="inline-flex items-center gap-2 text-[#FF2E88] hover:underline"
                        showIcon={false}
                      />
                    ) : (
                      <p>{content.addressName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {content.addressCity}
                    </p>
                  </div>
                </div>

                <div
                  className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-background/70 p-1 sm:w-fit sm:flex-row"
                  role="group"
                  aria-label="Actions coordonnées"
                >
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 rounded-md shadow-none"
                  >
                    <Link href={content.ctaPrimaryHref}>
                      {content.ctaPrimaryLabel}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-10 rounded-md shadow-none"
                  >
                    <Link href={content.ctaSecondaryHref}>
                      {content.ctaSecondaryLabel}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section>
            <Card
              id="contact-form"
              className="scroll-mt-24 border card-hover hover:border-[#FF2E88]/80"
            >
              <CardHeader>
                <CardTitle className="text-2xl">Formulaire de contact</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Indiquez votre besoin principal pour une réponse plus rapide.
                </p>
              </CardHeader>

              <CardContent>
                {contactAvailability.isAvailable ? (
                  <ContactForm initialSubject={initialSubject} />
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground">
                      <p className="font-medium">Formulaire temporairement indisponible</p>
                      <p className="mt-1 text-muted-foreground">
                        {contactAvailability.message}
                      </p>
                      <p className="mt-3 text-muted-foreground">
                        En attendant, vous pouvez ecrire directement a{" "}
                        <a
                          href={`mailto:${content.email}`}
                          className="font-medium text-[#FF2E88] hover:underline"
                        >
                          {content.email}
                        </a>
                        .
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`mailto:${content.email}`}
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                      >
                        Envoyer un e-mail
                      </Link>
                      <Link
                        href={content.ctaPrimaryHref}
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                      >
                        {content.ctaPrimaryLabel}
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
