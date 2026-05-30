import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type MemberRoleHubLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type MemberRoleHubProps = {
  title: string;
  description: string;
  eyebrow: string;
  links: MemberRoleHubLink[];
};

export function MemberRoleHub({
  title,
  description,
  eyebrow,
  links,
}: MemberRoleHubProps) {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Card
              key={link.href}
              className="border-border/70 bg-card/95 shadow-xs [background-image:none]"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-primary/15 bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  {link.disabled ? (
                    <span className="rounded-full border border-border/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      Bientot
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <CardTitle>{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {link.disabled ? (
                  <Button variant="ghost" className="px-0 text-muted-foreground">
                    Disponible prochainement
                  </Button>
                ) : (
                  <Button asChild variant="ghost" className="px-0">
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2"
                    >
                      Ouvrir
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
