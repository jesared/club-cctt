import ContactForm from "@/components/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { defaultContactContent } from "@/lib/contact-content";
import { prisma } from "@/lib/prisma";

export default async function ContactPage() {
  const content =
    (await prisma.contactContent.findUnique({ where: { id: "default" } })) ??
    defaultContactContent;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:py-12">
      <header className="rounded-3xl border bg-gradient-to-br from-background via-background to-muted/60 p-6 sm:p-8 shadow-sm">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {content.subtitle}
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
          {content.intro}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <Card className="h-full border bg-background">
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
                    className="text-primary hover:underline"
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
                  <p>{content.addressName}</p>
                  <p className="text-sm text-muted-foreground">
                    {content.addressCity}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={content.ctaPrimaryHref}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  {content.ctaPrimaryLabel}
                </Link>
                <Link
                  href={content.ctaSecondaryHref}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  {content.ctaSecondaryLabel}
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-2xl">Formulaire de contact</CardTitle>
              <p className="text-sm text-muted-foreground">
                Précisez votre demande pour une réponse plus rapide.
              </p>
            </CardHeader>

            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
