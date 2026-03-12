"use client";

import { trackKpiEvent } from "@/lib/kpi";
import { ComponentPropsWithoutRef } from "react";

type TrackedLinkProps = ComponentPropsWithoutRef<"a"> & {
  kpiPage: string;
  kpiLabel: string;
};

export default function TrackedLink({
  kpiPage,
  kpiLabel,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackKpiEvent({
          eventType: "CLICK",
          page: kpiPage,
          label: kpiLabel,
        });
        onClick?.(event);
      }}
    />
  );
}
