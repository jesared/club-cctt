"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type RegistrationBadgeProps = {
  label: string;
  tone: "open" | "upcoming" | "closed" | "unknown";
  tooltip?: string;
};

export default function RegistrationBadge({
  label,
  tone,
  tooltip,
}: RegistrationBadgeProps) {
  const className =
    tone === "open"
      ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600"
      : tone === "upcoming"
        ? "rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-600"
        : tone === "closed"
          ? "rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-600"
          : "rounded-full bg-muted/60 px-2.5 py-1 text-muted-foreground";

  if (!tooltip) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{label}</span>
      </TooltipTrigger>
      <TooltipContent className="left-1/2 top-full mt-2 -translate-x-1/2 translate-y-0 bg-foreground text-background">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
