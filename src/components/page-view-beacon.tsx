"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId } from "@/lib/visitor";

const HEARTBEAT_INTERVAL_MS = 20_000;

export default function PageViewBeacon() {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const sendHeartbeat = () => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "heartbeat", visitorId }),
        keepalive: true,
      }).catch(() => {});
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_view", visitorId }),
      keepalive: true,
    }).catch(() => {});

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
