import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDodo } from "@/lib/dodo";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let event;
  try {
    const dodo = getDodo();
    event = dodo.webhooks.unwrap(rawBody, {
      headers: {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (event.type === "payment.succeeded") {
    const bidId = event.data.metadata?.bidId as string | undefined;

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
