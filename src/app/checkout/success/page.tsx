import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-up/10 text-up">
        <CheckCircle2 size={30} />
      </div>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">
        Payment confirmed
      </h1>
      <p className="mt-2 max-w-sm text-sm text-foreground-dim">
        Your rank updates the moment Razorpay confirms the charge — usually within a
        few seconds. Refresh the leaderboard to see your new position.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-strong"
      >
        View the leaderboard
      </Link>
    </div>
  );
}
