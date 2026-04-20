import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionEyebrowProps = {
  children: React.ReactNode;
  tone?: "primary" | "neutral";
  className?: string;
};

export function SectionEyebrow({
  children,
  tone = "primary",
  className,
}: SectionEyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
        tone === "primary"
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border/70 bg-background/80 text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

type MetricTileProps = {
  label: string;
  value: string;
  detail?: string;
  className?: string;
};

export function MetricTile({
  label,
  value,
  detail,
  className,
}: MetricTileProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-background/88 p-4 shadow-sm shadow-black/5 backdrop-blur-sm",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  href?: string;
  label?: string;
  badges?: string[];
  details?: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
};

export function FeatureCard({
  title,
  description,
  href,
  label,
  badges,
  details,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-[1.4rem] border-border/70 bg-card/92 shadow-sm shadow-black/5 backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl font-bold tracking-[-0.025em]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
          {details && details.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-2xl border border-border/70 bg-background/85 px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {href && label ? (
          <div>
            <Link
              href={href}
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "rounded-full border-primary/20 px-5 text-sm text-primary hover:bg-primary/8 hover:text-primary",
              )}
            >
              {label}
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
