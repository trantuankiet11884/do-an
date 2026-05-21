const BEHAVIOR_EVENT_TYPES = [
  "SEARCH",
  "VIEW_PRODUCT",
  "ADD_CART",
  "CHECKOUT",
  "AI_CHAT",
] as const;

export type BehaviorEventType = (typeof BEHAVIOR_EVENT_TYPES)[number];

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("kds_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("kds_session_id", sessionId);
  }
  return sessionId;
}

export function trackBehavior(
  eventType: BehaviorEventType,
  eventData: Record<string, unknown>,
) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const payload = {
      sessionId,
      eventType,
      eventData: JSON.stringify(eventData),
      pageUrl: window.location.pathname,
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/behavior/track",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
    } else {
      fetch("/api/behavior/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silent fail — tracking should never break UX
  }
}
