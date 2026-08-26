import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-foreground-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="font-display font-bold text-foreground-dim">BuildRank</span>
          {" — "}pay to rank, get discovered.
        </p>
        <nav className="flex gap-6">
          <Link href="/about" className="hover:text-foreground-dim transition-colors">
            About
          </Link>
          <Link href="/stats" className="hover:text-foreground-dim transition-colors">
            Stats
          </Link>
          <Link href="/submit" className="hover:text-foreground-dim transition-colors">
            Submit
          </Link>
        </nav>
      </div>
    </footer>
  );
}
