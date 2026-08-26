import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, formatMoney, categoryLabel } from "@/lib/categories";
import CategoryTabs from "@/components/category-tabs";
import LeaderboardRow from "@/components/leaderboard-row";

export const revalidate = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const isValidCategory = CATEGORIES.some((c) => c.slug === category);
  const activeCategory = isValidCategory ? category : undefined;

  const [products, agg, productCount] = await Promise.all([
    prisma.product.findMany({
      where: activeCategory ? { category: activeCategory } : undefined,
      orderBy: { totalPaid: "desc" },
      take: 100,
    }),
    prisma.product.aggregate({ _sum: { totalPaid: true } }),
    prisma.product.count(),
  ]);

  const totalRevenue = agg._sum.totalPaid ?? 0;
  const topPrice = products[0]?.totalPaid ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <section className="border-b border-border py-12 sm:py-16">
        <h1 className="text-center font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          Grab #1 for {topPrice ? formatMoney(topPrice + 1) : "$1"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-foreground-dim sm:text-base">
          New spots start at $1. Paying less than #1 still puts you on the
          board at whatever place that bid can take.
        </p>

        <form
          action="/submit"
          className="mx-auto mt-7 flex max-w-xl flex-col gap-2.5 sm:flex-row"
        >
          <input
            name="url"
            required
            placeholder="Your product URL or @handle"
            className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <select
            name="category"
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
          >
            Grab it
          </button>
        </form>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {[
            { l: "Live products", v: productCount.toLocaleString() },
            { l: "Total paid out", v: formatMoney(totalRevenue) },
            { l: "Price of #1", v: topPrice ? formatMoney(topPrice) : "—" },
            { l: "Categories", v: String(CATEGORIES.length) },
          ].map((s) => (
            <div key={s.l} className="bg-surface px-4 py-3.5">
              <dt className="text-xs uppercase tracking-wide text-foreground-faint">{s.l}</dt>
              <dd className="mt-1 font-mono tabular-nums text-xl font-semibold text-foreground">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">
            {activeCategory ? categoryLabel(activeCategory) : "All categories"}
          </h2>
          <CategoryTabs active={activeCategory} />
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <p className="font-display text-lg font-bold text-foreground">
              This board is empty. Be #1.
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-faint">
              No one has claimed this category yet — the first submission takes the
              top spot automatically.
            </p>
            <Link
              href="/submit"
              className="mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-strong"
            >
              Claim #1
            </Link>
          </div>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {products.map((p, i) => (
              <LeaderboardRow key={p.id} product={p} rank={i + 1} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
