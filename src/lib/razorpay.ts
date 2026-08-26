import Razorpay from "razorpay";

let razorpaySingleton: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set. Add your Razorpay keys to .env before accepting real bids."
    );
  }
  if (!razorpaySingleton) {
    razorpaySingleton = new Razorpay({ key_id, key_secret });
  }
  return razorpaySingleton;
}
