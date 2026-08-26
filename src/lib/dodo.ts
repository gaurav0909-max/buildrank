import DodoPayments from "dodopayments";

let dodoSingleton: DodoPayments | null = null;

export function getDodo(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) {
    throw new Error(
      "DODO_PAYMENTS_API_KEY is not set. Add your Dodo Payments API key to .env before accepting real bids."
    );
  }
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
  if (!dodoSingleton) {
    dodoSingleton = new DodoPayments({ bearerToken, environment });
  }
  return dodoSingleton;
}
