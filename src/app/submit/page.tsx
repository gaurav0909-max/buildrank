"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

function centsFromDollarsInput(v: string): number {
  const n = Math.round(parseFloat(v || "0") * 100);
  return Number.isFinite(n) ? n : 0;
}

export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <SubmitForm />
    </Suspense>
  );
}

function SubmitForm() {
  const params = useSearchParams();
  const outbidId = params.get("outbid");
  const minCents = Number(params.get("min") ?? 500) || 500;

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [imageUrl, setImageUrl] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [amountInput, setAmountInput] = useState((minCents / 100).toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmountInput((minCents / 100).toFixed(2));
  }, [minCents]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amount = centsFromDollarsInput(amountInput);

    if (!ownerEmail) {
      setError("Enter your email so we can send a receipt and let you re-bid later.");
      return;
    }
    if (amount < minCents) {
      setError(`Minimum bid is $${(minCents / 100).toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      const body = outbidId
        ? { mode: "outbid", productId: outbidId, amount, ownerEmail }
        : { mode: "new", name, url, tagline, category, imageUrl, ownerEmail, amount };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Checkout failed.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
        {outbidId ? "Reclaim the spot" : "New submission"}
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground">
        {outbidId ? "Outbid the current holder" : "Submit your project"}
      </h1>
      <p className="mt-3 text-sm text-foreground-dim">
        {outbidId
          ? `Minimum bid to take this spot is $${(minCents / 100).toFixed(2)}. Rank is decided purely by total paid — no review, no waiting.`
          : "Pick a category, set your price, and you're live the moment payment confirms. No approval queue."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {!outbidId && (
          <>
            <Field label="Project name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="devkit-cli"
                className={inputClass}
              />
            </Field>
            <Field label="URL">
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/you/devkit-cli"
                className={inputClass}
              />
            </Field>
            <Field label="Tagline">
              <input
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="One line — what does it do?"
                maxLength={90}
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Logo image URL (optional)">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Leave blank to auto-generate one"
                className={inputClass}
              />
            </Field>
          </>
        )}

        <Field label="Your email">
          <input
            required
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>

        <Field label={`Bid amount (min $${(minCents / 100).toFixed(2)})`}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-foreground-faint">
              $
            </span>
            <input
              required
              type="number"
              min={minCents / 100}
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className={`${inputClass} pl-7 font-mono tabular-nums`}
            />
          </div>
        </Field>

        {error && (
          <p className="rounded-lg bg-down/10 px-3.5 py-2.5 text-sm text-down">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink shadow-sm transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {loading ? "Redirecting to checkout…" : `Pay $${amountInput || "0.00"} & go live`}
        </button>
        <p className="text-center text-xs text-foreground-faint">
          Payment via Stripe Checkout. Rank updates the instant payment confirms.
        </p>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground-dim">{label}</span>
      {children}
    </label>
  );
}
