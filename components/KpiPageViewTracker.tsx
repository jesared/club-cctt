"use client";

import { useEffect } from "react";
import { trackKpiEvent } from "@/lib/kpi";

type KpiPageViewTrackerProps = {
  page: string;
  label?: string;
};

export default function KpiPageViewTracker({
  page,
  label,
}: KpiPageViewTrackerProps) {
  useEffect(() => {
    trackKpiEvent({
      eventType: "VIEW",
      page,
      label,
    });
  }, [label, page]);

  return null;
}
