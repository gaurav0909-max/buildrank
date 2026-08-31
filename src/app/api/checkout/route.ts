import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getDodo } from "@/lib/dodo";
import { CATEGORIES } from "@/lib/categories";

const MIN_BID_DOLLARS = 1;

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (/^https?:\/\/.+/i.test(trimmed)) return trimmed;

  const handleMatch = /^@?([A-Za-z0-9_]{1,15})$/.exec(trimmed);
  if (handleMatch) return `https://x.com/${handleMatch[1]}`;

  const bareDomainMatch =
    /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:\/\S*)?$/i.test(trimmed);
  if (bareDomainMatch) return `https://${trimmed}`;

  return null;
}

function getListingProductId(): string {
  const id = process.env.DODO_LISTING_PRODUCT_ID;
  if (!id) {
    throw new Error(
      "DODO_LISTING_PRODUCT_ID is not set. Create a $1 one-time product in Dodo Payments and add its id to .env."
    );
  }
  return id;
}

const newSubmissionSchema = {
  parse(body: unknown) {
    const b = body as Record<string, unknown>;
    if (typeof b.name !== "string" || b.name.trim().length < 2) {
      throw new Error("Project name is required.");
    }
    const url = typeof b.url === "string" ? normalizeUrl(b.url) : null;
    if (!url) {
      throw new Error("Enter a valid URL (https://...) or an @handle.");
    }
    if (typeof b.tagline !== "string" || b.tagline.trim().length < 5) {
      throw new Error("Tagline must be at least 5 characters.");
    }
    if (typeof b.category !== "string" || !CATEGORIES.some((c) => c.slug === b.category)) {
      throw new Error("Choose a valid category.");
    }
    if (typeof b.ownerEmail !== "string" || !/^\S+@\S+\.\S+$/.test(b.ownerEmail)) {
      throw new Error("A valid email is required.");
    }
    const amount = Number(b.amount);
    if (!Number.isInteger(amount) || amount < MIN_BID_DOLLARS) {
      throw new Error(`Minimum bid is $${MIN_BID_DOLLARS}.`);
    }
    return {
      name: b.name.trim(),
      url,
      tagline: (b.tagline as string).trim(),
      category: b.category as string,
      ownerEmail: b.ownerEmail as string,
      imageUrl:
        typeof b.imageUrl === "string" && b.imageUrl
          ? b.imageUrl
          : `https://api.dicebear.com/9.x/shapes/png?seed=${encodeURIComponent(b.name as string)}`,
      amount,
    };
  },
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as { mode?: string; productId?: string; amount?: number; ownerEmail?: string };
  const origin = req.nextUrl.origin;

  try {
    const dodo = getDodo();
    const listingProductId = getListingProductId();

    if (b.mode === "outbid") {
      if (typeof b.productId !== "string") {
        return NextResponse.json({ error: "Missing productId." }, { status: 400 });
      }
      const product = await prisma.product.findUnique({ where: { id: b.productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
      const minAmount = product.totalPaid + MIN_BID_DOLLARS;
      const amount = Number(b.amount);
      if (!Number.isInteger(amount) || amount < minAmount) {
        return NextResponse.json(
          { error: `Bid must be at least $${minAmount}.` },
          { status: 400 }
        );
      }
      const ownerEmail =
        typeof b.ownerEmail === "string" && b.ownerEmail ? b.ownerEmail : product.ownerEmail;

      const bid = await prisma.bid.create({
        data: { productId: product.id, amount, status: "pending" },
      });

      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: listingProductId, quantity: amount }],
        customer: { email: ownerEmail },
        metadata: { bidId: bid.id, productId: product.id },
        return_url: `${origin}/checkout/success`,
      });

      if (!session.checkout_url) {
        return NextResponse.json({ error: "Checkout URL was not returned." }, { status: 502 });
      }

      await prisma.bid.update({
        where: { id: bid.id },
        data: { dodoCheckoutSession: session.session_id },
      });

      return NextResponse.json({ url: session.checkout_url });
    }

    // New submission
    const data = newSubmissionSchema.parse(b);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        url: data.url,
        tagline: data.tagline,
        category: data.category,
        imageUrl: data.imageUrl,
        ownerEmail: data.ownerEmail,
        ownerToken: randomUUID(),
        totalPaid: 0,
      },
    });

    const bid = await prisma.bid.create({
      data: { productId: product.id, amount: data.amount, status: "pending" },
    });

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: listingProductId, quantity: data.amount }],
      customer: { email: data.ownerEmail },
      metadata: { bidId: bid.id, productId: product.id },
      return_url: `${origin}/checkout/success`,
    });

    if (!session.checkout_url) {
      return NextResponse.json({ error: "Checkout URL was not returned." }, { status: 502 });
    }

    await prisma.bid.update({
      where: { id: bid.id },
      data: { dodoCheckoutSession: session.session_id },
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
