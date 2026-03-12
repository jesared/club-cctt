export type KpiEventType = "VIEW" | "CLICK" | "START" | "SUBMIT";

type TrackKpiPayload = {
  eventType: KpiEventType;
  page: string;
  label?: string;
};

export function trackKpiEvent(payload: TrackKpiPayload) {
  const body = JSON.stringify(payload);

  if (typeof window !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/kpi", blob);
    return;
  }

  void fetch("/api/kpi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}
