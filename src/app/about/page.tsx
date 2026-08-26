import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How BuildRank's pay-to-rank leaderboard works: submit, bid, get outbid, get discovered.",
};

const faqs = [
  {
    q: "How is rank decided?",
    a: "Purely by total amount paid, all-time, per project. No algorithm, no editorial review, no follower count. Whoever has paid the most holds the spot.",
  },
  {
    q: "What happens when I get outbid?",
    a: "You drop to wherever your total lands you. You keep your listing — you're just no longer at the top. You can always pay again to reclaim it.",
  },
  {
    q: "Is there a minimum bid?",
    a: "Yes — $1 to submit, and any overtake must beat the current holder's total by at least $1. Prices are shown in USD; you're charged the INR equivalent at checkout.",
  },
  {
    q: "Do listings expire?",
    a: "No. A paid rank holds indefinitely until someone outbids it — there's no decay and no time limit.",
  },
  {
    q: "Can I remove my project?",
    a: "Email us from the address you submitted with and we'll take it down. Bids already placed are not refunded.",
  },
  {
    q: "Why would I pay to rank higher?",
    a: "Distribution. #1 gets seen by every builder and founder who visits the board — the same audience that would otherwise cost you real money to reach through ads.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        How BuildRank works
      </h1>
      <p className="mt-4 text-base leading-relaxed text-foreground-dim">
        BuildRank is a public pay-to-rank leaderboard. Submit anything — a
        product, a project, a profile. Pay to rank it higher. If someone pays
        more, they take your spot. That's the entire mechanic.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {faqs.map((f) => (
          <div key={f.q} className="border-t border-border pt-5 first:border-t-0 first:pt-0">
            <h2 className="font-display text-base font-bold text-foreground">{f.q}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground-dim">{f.a}</p>
          </div>
        ))}
      </div>

      <Link
        href="/submit"
        className="mt-10 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-strong"
      >
        Submit your project
      </Link>
    </div>
  );
}
