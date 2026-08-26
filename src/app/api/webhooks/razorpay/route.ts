import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidSignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  const payload = await req.text();

  if (!signature || !isValidSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    event?: string;
    payload?: { payment_link?: { entity?: { notes?: Record<string, string> } } };
  };

  if (event.event === "payment_link.paid") {
    const bidId = event.payload?.payment_link?.entity?.notes?.bidId;

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
