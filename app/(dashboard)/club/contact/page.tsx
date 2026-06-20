import ContactForm from "@/components/ContactForm";
import { ExternalMapLink } from "@/components/external-map-link";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClubContextNav from "@/components/public/club-context-nav";
import Reveal from "@/components/Reveal";
import { ctaToneClasses } from "@/lib/cta-theme";
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
          <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] animate-fade-up-1 ${ctaToneClasses.contact.eyebrow}`}>
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
                  className={`group block rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-md ${ctaToneClasses.contact.cardHover}`}
                >
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                  <p className={`mt-4 text-sm font-medium ${ctaToneClasses.contact.link}`}>
                    Choisir ce motif
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
            <Card className={`h-full border bg-background card-hover ${ctaToneClasses.contact.cardHover}`}>
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
                      className={`${ctaToneClasses.contact.link} hover:underline`}
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
                        className={`inline-flex items-center gap-2 hover:underline ${ctaToneClasses.contact.link}`}
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

                <ButtonGroup
                  className="w-full min-w-0 bg-transparent p-0 shadow-none sm:w-fit"
                  aria-label="Actions coordonnées"
                >
                  <Button
                    asChild
                    className={`h-10 min-w-0 flex-1 rounded-xl px-4 font-semibold sm:min-w-[12rem] ${ctaToneClasses.contact.primaryButton}`}
                  >
                    <Link href={content.ctaPrimaryHref}>
                      {content.ctaPrimaryLabel}
                    </Link>
                  </Button>
                  <ButtonGroupSeparator className="mx-px hidden sm:block" />
                  <Button
                    asChild
                    variant="ghost"
                    className={`h-10 min-w-0 flex-1 rounded-xl px-4 font-semibold sm:min-w-[12rem] ${ctaToneClasses.contact.softBorderButton}`}
                  >
                    <Link href={content.ctaSecondaryHref}>
                      {content.ctaSecondaryLabel}
                    </Link>
                  </Button>
                </ButtonGroup>
              </CardContent>
            </Card>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section>
            <Card
              id="contact-form"
              className={`scroll-mt-24 border card-hover ${ctaToneClasses.contact.cardHover}`}
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
                          className={`font-medium hover:underline ${ctaToneClasses.contact.link}`}
                        >
                          {content.email}
                        </a>
                        .
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className={ctaToneClasses.contact.softBorderButton}
                      >
                        <Link href={`mailto:${content.email}`}>
                          Écrire au club
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className={ctaToneClasses.contact.softBorderButton}
                      >
                        <Link href={content.ctaPrimaryHref}>
                          {content.ctaPrimaryLabel}
                        </Link>
                      </Button>
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
