import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { CATEGORIES } from "@/lib/categories";

const MIN_BID_CENTS = 500;

const newSubmissionSchema = {
  parse(body: unknown) {
    const b = body as Record<string, unknown>;
    if (typeof b.name !== "string" || b.name.trim().length < 2) {
      throw new Error("Project name is required.");
    }
    if (typeof b.url !== "string" || !/^https?:\/\//.test(b.url)) {
      throw new Error("A valid URL (starting with http/https) is required.");
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
    if (!Number.isInteger(amount) || amount < MIN_BID_CENTS) {
      throw new Error(`Minimum bid is $${(MIN_BID_CENTS / 100).toFixed(2)}.`);
    }
    return {
      name: b.name.trim(),
      url: b.url as string,
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
    const stripe = getStripe();

    if (b.mode === "outbid") {
      if (typeof b.productId !== "string") {
        return NextResponse.json({ error: "Missing productId." }, { status: 400 });
      }
      const product = await prisma.product.findUnique({ where: { id: b.productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
      const minAmount = product.totalPaid + MIN_BID_CENTS;
      const amount = Number(b.amount);
      if (!Number.isInteger(amount) || amount < minAmount) {
        return NextResponse.json(
          { error: `Bid must be at least $${(minAmount / 100).toFixed(2)}.` },
          { status: 400 }
        );
      }
      const ownerEmail =
        typeof b.ownerEmail === "string" && b.ownerEmail ? b.ownerEmail : product.ownerEmail;

      const bid = await prisma.bid.create({
        data: { productId: product.id, amount, status: "pending" },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: ownerEmail,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: `Outbid on BuildRank — ${product.name}`,
                description: `Move ${product.name} to the top of the BuildRank leaderboard.`,
              },
            },
          },
        ],
        metadata: { bidId: bid.id, productId: product.id },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/submit?outbid=${product.id}&min=${minAmount}`,
      });

      await prisma.bid.update({
        where: { id: bid.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({ url: session.url });
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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: data.ownerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: data.amount,
            product_data: {
              name: `BuildRank submission — ${data.name}`,
              description: `List ${data.name} on the BuildRank leaderboard.`,
            },
          },
        },
      ],
      metadata: { bidId: bid.id, productId: product.id },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/submit`,
    });

    await prisma.bid.update({
      where: { id: bid.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
