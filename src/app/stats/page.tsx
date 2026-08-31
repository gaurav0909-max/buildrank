import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryLabel, formatMoney } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Stats",
  description: "Live revenue, traffic, and category breakdown for BuildRank.",
};

export const revalidate = 30;

export default async function StatsPage() {
  const [agg, productCount, pageViews, recentBids, byCategory] = await Promise.all([
    prisma.product.aggregate({ _sum: { totalPaid: true, clicks: true } }),
    prisma.product.count({ where: { totalPaid: { gt: 0 } } }),
    prisma.visitEvent.count({ where: { type: "page_view" } }),
    prisma.bid.findMany({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: true },
    }),
    Promise.all(
      CATEGORIES.map(async (c) => {
        const a = await prisma.product.aggregate({
          where: { category: c.slug, totalPaid: { gt: 0 } },
          _sum: { totalPaid: true },
          _count: true,
        });
        return { ...c, revenue: a._sum.totalPaid ?? 0, count: a._count };
      })
    ),
  ]);

  const totalRevenue = agg._sum.totalPaid ?? 0;
  const totalClicks = agg._sum.clicks ?? 0;
  const maxCategoryRevenue = Math.max(1, ...byCategory.map((c) => c.revenue));

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Live stats
      </h1>
      <p className="mt-3 text-sm text-foreground-dim">
        Everything below updates as new bids come in — no vanity numbers, just the
        ledger.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {[
          { l: "Total revenue", v: formatMoney(totalRevenue) },
          { l: "Live products", v: productCount.toLocaleString() },
          { l: "Page views", v: pageViews.toLocaleString() },
          { l: "Product clicks", v: totalClicks.toLocaleString() },
        ].map((s) => (
          <div key={s.l} className="bg-surface px-4 py-4">
            <dt className="text-xs uppercase tracking-wide text-foreground-faint">{s.l}</dt>
            <dd className="mt-1 font-mono tabular-nums text-2xl font-semibold text-foreground">
              {s.v}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 font-display text-lg font-bold text-foreground">
        Revenue by category
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {byCategory
          .sort((a, b) => b.revenue - a.revenue)
          .map((c) => (
            <div key={c.slug} className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-sm text-foreground-dim">{c.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(c.revenue / maxCategoryRevenue) * 100}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-mono tabular-nums text-sm text-foreground">
                {formatMoney(c.revenue)}
              </span>
              <span className="w-16 shrink-0 text-right text-xs text-foreground-faint">
                {c.count} listed
              </span>
            </div>
          ))}
      </div>

      <h2 className="mt-12 font-display text-lg font-bold text-foreground">Recent bids</h2>
      <ul className="mt-4 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {recentBids.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-foreground-faint">
            No bids yet — be the first.
          </li>
        )}
        {recentBids.map((bid) => (
          <li key={bid.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-foreground-dim">
              <span className="font-medium text-foreground">{bid.product.name}</span>{" "}
              received a bid in {categoryLabel(bid.product.category)}
            </span>
            <span className="font-mono tabular-nums font-medium text-accent">
              {formatMoney(bid.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
