import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature ?? "", webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bidId = session.metadata?.bidId;

    if (bidId) {
      const bid = await prisma.bid.findUnique({ where: { id: bidId } });

      // Idempotent: only apply the rank change once per bid.
      if (bid && bid.status !== "paid") {
        await prisma.$transaction([
          prisma.bid.update({ where: { id: bidId }, data: { status: "paid" } }),
          prisma.product.update({
            where: { id: bid.productId },
            data: { totalPaid: { increment: bid.amount } },
          }),
          prisma.visitEvent.create({
            data: { type: "submit_complete", productId: bid.productId },
          }),
        ]);
      }
    }
  }

  return NextResponse.json({ received: true });
}
