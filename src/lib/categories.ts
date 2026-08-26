export type CategorySlug =
  | "agencies"
  | "ai-agents"
  | "ai-tools"
  | "marketing"
  | "design"
  | "crypto"
  | "dev-tools"
  | "directories"
  | "ecommerce"
  | "education"
  | "finance"
  | "games"
  | "health"
  | "productivity"
  | "real-estate"
  | "social"
  | "travel"
  | "other";

export const CATEGORIES: { slug: CategorySlug; label: string; short: string }[] = [
  { slug: "agencies", label: "Agencies", short: "Agencies" },
  { slug: "ai-agents", label: "AI Agents", short: "AI Agents" },
  { slug: "ai-tools", label: "AI Tools", short: "AI Tools" },
  { slug: "marketing", label: "Marketing & Advertising", short: "Marketing" },
  { slug: "design", label: "Design & Creative", short: "Design" },
  { slug: "crypto", label: "Crypto & Web3", short: "Crypto" },
  { slug: "dev-tools", label: "Developer Tools", short: "Dev Tools" },
  { slug: "directories", label: "Directories & Launch", short: "Directories" },
  { slug: "ecommerce", label: "Ecommerce & Retail", short: "Ecommerce" },
  { slug: "education", label: "Education & Learning", short: "Education" },
  { slug: "finance", label: "Business & Finance", short: "Finance" },
  { slug: "games", label: "Games & Entertainment", short: "Games" },
  { slug: "health", label: "Health & Wellness", short: "Health" },
  { slug: "productivity", label: "Productivity & Tools", short: "Productivity" },
  { slug: "real-estate", label: "Real Estate & Property", short: "Real Estate" },
  { slug: "social", label: "Social & Creator Tools", short: "Social" },
  { slug: "travel", label: "Travel & Local", short: "Travel" },
  { slug: "other", label: "Other", short: "Other" },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function formatMoney(dollars: number): string {
  return `$${Math.round(dollars).toLocaleString("en-US")}`;
}
