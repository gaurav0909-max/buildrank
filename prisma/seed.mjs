import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { randomUUID } from "node:crypto";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "queue-lite",
    url: "https://github.com/example/queue-lite",
    tagline: "A dependency-free job queue for Node, in 400 lines.",
    category: "open-source",
    totalPaid: 18500,
    clicks: 4210,
  },
  {
    name: "PromptForge",
    url: "https://promptforge.example.com",
    tagline: "Version control and A/B testing for your LLM prompts.",
    category: "ai-tool",
    totalPaid: 15200,
    clicks: 3870,
  },
  {
    name: "InvoiceFlow",
    url: "https://invoiceflow.example.com",
    tagline: "Invoicing for freelancers who bill in three currencies.",
    category: "saas",
    totalPaid: 9800,
    clicks: 2640,
  },
  {
    name: "TabTidy",
    url: "https://chrome.google.com/webstore/detail/tabtidy",
    tagline: "Auto-groups your browser tabs by project. Free, no account.",
    category: "extension",
    totalPaid: 6400,
    clicks: 2190,
  },
  {
    name: "HabitLoop",
    url: "https://apps.apple.com/app/habitloop",
    tagline: "The habit tracker that texts your friend when you skip a day.",
    category: "mobile-app",
    totalPaid: 4300,
    clicks: 1580,
  },
  {
    name: "devkit-cli",
    url: "https://github.com/example/devkit-cli",
    tagline: "One command to scaffold a typed API, DB, and CI pipeline.",
    category: "github",
    totalPaid: 2900,
    clicks: 1120,
  },
  {
    name: "Alex Chen — Product Engineer",
    url: "https://alexchen.example.dev",
    tagline: "Portfolio and case studies from 6 years of building dev tools.",
    category: "portfolio",
    totalPaid: 1500,
    clicks: 640,
  },
];

async function main() {
  console.log("Seeding BuildRank...");

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        url: p.url,
        tagline: p.tagline,
        imageUrl: `https://api.dicebear.com/9.x/shapes/png?seed=${encodeURIComponent(p.name)}`,
        ownerEmail: "founder@example.com",
        ownerToken: randomUUID(),
        category: p.category,
        totalPaid: p.totalPaid,
        clicks: p.clicks,
      },
    });

    await prisma.bid.create({
      data: {
        productId: product.id,
        amount: p.totalPaid,
        status: "paid",
        stripeSessionId: `seed_${product.id}`,
      },
    });

    for (let i = 0; i < Math.round(p.clicks / 40); i++) {
      await prisma.visitEvent.create({
        data: { type: "product_click", productId: product.id },
      });
    }
  }

  for (let i = 0; i < 300; i++) {
    await prisma.visitEvent.create({ data: { type: "page_view" } });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
