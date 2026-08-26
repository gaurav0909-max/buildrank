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
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-strong">
          Pay to rank · get outbid · get discovered
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          The leaderboard for what builders actually made.
        </h1>
        <p className="mt-4 max-w-xl text-base text-foreground-dim sm:text-lg">
          Submit your SaaS, AI tool, extension, app, or repo. Pay to rank higher.
          Get outbid and lose the spot. #1 gets seen by every builder who visits.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
          >
            Submit your project
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground-dim transition-colors hover:border-accent/40 hover:text-foreground"
          >
            How it works
          </Link>
        </div>

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
