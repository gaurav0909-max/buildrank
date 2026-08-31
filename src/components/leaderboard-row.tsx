"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { categoryLabel, formatMoney } from "@/lib/categories";

export type LeaderboardProduct = {
  id: string;
  name: string;
  url: string;
  tagline: string;
  imageUrl: string;
  category: string;
  totalPaid: number;
  clicks: number;
};

const MIN_INCREMENT = 1; // $1 minimum increment

export default function LeaderboardRow({
  product,
  rank,
}: {
  product: LeaderboardProduct;
  rank: number;
}) {
  const priceToBeat = product.totalPaid + MIN_INCREMENT;
  const podium = rank <= 3;
  const router = useRouter();

  return (
    <li className="group relative">
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(`/product/${product.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(`/product/${product.id}`);
        }}
        className={
          "flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors sm:gap-5 sm:px-5 " +
          (podium
            ? "border-accent/35 bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            : "border-border bg-surface hover:border-accent/30")
        }
      >
        <div
          className={
            "font-display font-extrabold tabular-nums shrink-0 text-center " +
            (rank === 1
              ? "w-9 text-2xl text-accent"
              : podium
                ? "w-9 text-xl text-accent-strong"
                : "w-9 text-lg text-foreground-faint")
          }
        >
          {rank}
        </div>

        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted sm:h-12 sm:w-12">
          <Image
            src={product.imageUrl}
            alt={`${product.name} logo`}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.id}`}
              className="truncate font-semibold text-foreground hover:text-accent transition-colors"
            >
              {product.name}
            </Link>
            <span className="hidden shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-foreground-dim sm:inline">
              {categoryLabel(product.category)}
            </span>
          </div>
          <p className="truncate text-sm text-foreground-faint">{product.tagline}</p>
        </div>

        <div className="hidden text-right text-xs text-foreground-faint md:block">
          <div className="tabular-nums">{product.clicks.toLocaleString()} clicks</div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-mono tabular-nums text-base font-medium text-foreground sm:text-lg">
            {formatMoney(product.totalPaid)}
          </div>
          <Link
            href={`/submit?outbid=${product.id}&min=${priceToBeat}`}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 mt-0.5 inline-block text-xs font-semibold text-accent hover:text-accent-strong"
          >
            Overtake for {formatMoney(priceToBeat)}
          </Link>
        </div>
      </div>
    </li>
  );
}
