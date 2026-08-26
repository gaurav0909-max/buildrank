export type CategorySlug =
  | "github"
  | "saas"
  | "ai-tool"
  | "extension"
  | "mobile-app"
  | "portfolio"
  | "open-source";

export const CATEGORIES: { slug: CategorySlug; label: string; short: string }[] = [
  { slug: "github", label: "GitHub Project", short: "GitHub" },
  { slug: "saas", label: "SaaS", short: "SaaS" },
  { slug: "ai-tool", label: "AI Tool", short: "AI Tool" },
  { slug: "extension", label: "Chrome Extension", short: "Extension" },
  { slug: "mobile-app", label: "Mobile App", short: "Mobile" },
  { slug: "portfolio", label: "Portfolio", short: "Portfolio" },
  { slug: "open-source", label: "Open Source", short: "OSS" },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
