import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryTabs({ active }: { active?: string }) {
  const tabs = [{ slug: undefined, short: "All" }, ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = tab.slug === active;
        const href = tab.slug ? `/?category=${tab.slug}` : "/";
        return (
          <Link
            key={tab.short}
            href={href}
            className={
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (isActive
                ? "border-accent bg-accent text-accent-ink"
                : "border-border bg-surface text-foreground-dim hover:border-accent/50 hover:text-foreground")
            }
          >
            {tab.short}
          </Link>
        );
      })}
    </div>
  );
}
