import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryLabel, formatMoney } from "@/lib/categories";

type Params = { params: Promise<{ id: string }> };

async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    openGraph: { title: product.name, description: product.tagline },
  };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [rankAbove, categoryRankAbove] = await Promise.all([
    prisma.product.count({ where: { totalPaid: { gt: product.totalPaid } } }),
    prisma.product.count({
      where: { category: product.category, totalPaid: { gt: product.totalPaid } },
    }),
  ]);

  const globalRank = rankAbove + 1;
  const categoryRank = categoryRankAbove + 1;
  const priceToBeat = product.totalPaid + 1;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <Link href="/" className="text-sm text-foreground-faint hover:text-foreground-dim">
        ← Back to leaderboard
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
          <Image src={product.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-foreground-dim">
            {categoryLabel(product.category)}
          </span>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-1 text-foreground-dim">{product.tagline}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border">
        <div className="bg-surface px-4 py-3.5">
          <dt className="text-xs uppercase tracking-wide text-foreground-faint">Global rank</dt>
          <dd className="mt-1 font-mono tabular-nums text-xl font-semibold text-foreground">
            #{globalRank}
          </dd>
        </div>
        <div className="bg-surface px-4 py-3.5">
          <dt className="text-xs uppercase tracking-wide text-foreground-faint">Category rank</dt>
          <dd className="mt-1 font-mono tabular-nums text-xl font-semibold text-foreground">
            #{categoryRank}
          </dd>
        </div>
        <div className="bg-surface px-4 py-3.5">
          <dt className="text-xs uppercase tracking-wide text-foreground-faint">Total paid</dt>
          <dd className="mt-1 font-mono tabular-nums text-xl font-semibold text-foreground">
            {formatMoney(product.totalPaid)}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground-dim transition-colors hover:border-accent/40 hover:text-foreground"
        >
          Visit {product.name} →
        </a>
        <Link
          href={`/submit?outbid=${product.id}&min=${priceToBeat}`}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Overtake for {formatMoney(priceToBeat)}
        </Link>
      </div>
    </div>
  );
}
