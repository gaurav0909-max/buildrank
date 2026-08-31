import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categoryLabel, formatMoney } from "@/lib/categories";
import VisitLink from "@/components/visit-link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildrank.lol";

type Params = { params: Promise<{ id: string }> };

async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  const title = `${product.name} — ${categoryLabel(product.category)} on BuildRank`;
  return {
    title,
    description: product.tagline,
    alternates: { canonical: `${siteUrl}/product/${id}` },
    openGraph: { title, description: product.tagline, url: `${siteUrl}/product/${id}` },
    twitter: { title, description: product.tagline },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: product.name,
    description: product.tagline,
    url: `${siteUrl}/product/${product.id}`,
    applicationCategory: categoryLabel(product.category),
    mainEntityOfPage: `${siteUrl}/product/${product.id}`,
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-sm text-foreground-faint hover:text-foreground-dim">
        ← Back to leaderboard
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
          <Image
            src={product.imageUrl}
            alt={`${product.name} logo`}
            fill
            sizes="64px"
            className="object-cover"
          />
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
        <VisitLink productId={product.id} url={product.url} name={product.name} />
        <Link
          href={`/submit?outbid=${product.id}&min=${priceToBeat}`}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Overtake for {formatMoney(priceToBeat)}
        </Link>
      </div>

      <a
        href={`mailto:${
          process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@buildrank.lol"
        }?subject=${encodeURIComponent(`Report listing: ${product.name}`)}&body=${encodeURIComponent(
          `Reporting this listing:\n\nName: ${product.name}\nLink: ${product.url}\nListing page: ${product.id}\n\nReason:\n`
        )}`}
        className="mt-6 inline-block text-xs text-foreground-faint hover:text-foreground-dim"
      >
        Report this listing
      </a>
    </div>
  );
}
