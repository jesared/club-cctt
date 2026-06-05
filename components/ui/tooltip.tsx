"use client";

import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({ children }: { children: ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

function Tooltip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("group relative", className)}>{children}</div>;
}

function TooltipTrigger({ children }: { children: ReactElement; asChild?: boolean }) {
  return children;
}

function TooltipContent({ children, className }: { children: ReactNode; side?: "right" | "left" | "top" | "bottom"; className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100",
        "group-focus-within:opacity-100",
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
