"use client";

import { useEffect } from "react";

export default function PageViewBeacon() {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_view" }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
