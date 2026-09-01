import Link from "next/link";
import { getHeaderStats } from "@/lib/site-stats";
import { formatMoney } from "@/lib/categories";

export default async function Header() {
  const stats = await getHeaderStats();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink font-display font-extrabold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            #1
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            BuildRank
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground-dim sm:flex">
          <Link href="/" className="hover:text-foreground transition-colors">
            Leaderboard
          </Link>
          <Link href="/stats" className="hover:text-foreground transition-colors">
            Stats
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/stats"
            className="hidden items-center gap-3 rounded-full border border-border/70 bg-surface/60 px-4 py-1.5 text-xs font-medium text-foreground-dim transition-colors hover:border-accent/40 hover:bg-surface lg:flex"
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {formatMoney(stats.totalRevenue)} made
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              {stats.watchingNow.toLocaleString()} watching
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {stats.uniqueVisitors.toLocaleString()} visitors in {stats.daysSinceLaunch}d
            </span>
          </Link>

          <Link
            href="/submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-sm transition-colors hover:bg-accent-strong shrink-0"
          >
            Submit project
          </Link>
        </div>
      </div>
    </header>
  );
}
