const FALLBACK_USD_TO_INR = 88;
const CACHE_TTL_MS = 60 * 60 * 1000;

let cached: { rate: number; fetchedAt: number } | null = null;

export async function getUsdToInrRate(): Promise<number> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`FX API returned ${res.status}`);
    const data = (await res.json()) as { rates?: { INR?: number } };
    const rate = data.rates?.INR;
    if (typeof rate !== "number" || rate <= 0) throw new Error("Invalid FX response");
    cached = { rate, fetchedAt: Date.now() };
    return rate;
  } catch {
    return cached?.rate ?? FALLBACK_USD_TO_INR;
  }
}

// USD cents and INR paise are both "smallest unit / 100", so the conversion
// factor is just the raw USD->INR rate applied directly to the cents value.
export function usdCentsToInrPaise(usdCents: number, rate: number): number {
  return Math.round(usdCents * rate);
}
