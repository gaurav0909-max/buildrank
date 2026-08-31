"use client";

export default function VisitLink({
  productId,
  url,
  name,
}: {
  productId: string;
  url: string;
  name: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "click", productId }),
          keepalive: true,
        }).catch(() => {});
      }}
      className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground-dim transition-colors hover:border-accent/40 hover:text-foreground"
    >
      Visit {name} →
    </a>
  );
}
