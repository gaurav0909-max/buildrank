import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as { type?: string; productId?: string; visitorId?: string };
  const referrer = req.headers.get("referer");
  const visitorId = typeof b.visitorId === "string" ? b.visitorId : null;

  if (b.type === "page_view") {
    await prisma.visitEvent.create({ data: { type: "page_view", referrer, visitorId } });
    return NextResponse.json({ ok: true });
  }

  if (b.type === "click" && typeof b.productId === "string") {
    const product = await prisma.product.findUnique({ where: { id: b.productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    await prisma.$transaction([
      prisma.product.update({
        where: { id: b.productId },
        data: { clicks: { increment: 1 } },
      }),
      prisma.visitEvent.create({
        data: { type: "product_click", productId: b.productId, referrer, visitorId },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (b.type === "heartbeat" && visitorId) {
    await prisma.presence.upsert({
      where: { visitorId },
      create: { visitorId },
      update: { lastSeenAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
}
