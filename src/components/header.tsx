import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
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

        <Link
          href="/submit"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
        >
          Submit project
        </Link>
      </div>
    </header>
  );
}
