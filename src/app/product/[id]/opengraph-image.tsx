import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { categoryLabel, formatMoney } from "@/lib/categories";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  const [rankAbove] = product
    ? await Promise.all([
        prisma.product.count({ where: { totalPaid: { gt: product.totalPaid } } }),
      ])
    : [0];

  const name = product?.name ?? "BuildRank listing";
  const tagline = product?.tagline ?? "";
  const category = product ? categoryLabel(product.category) : "";
  const rank = product ? `#${rankAbove + 1}` : "";
  const totalPaid = product ? formatMoney(product.totalPaid) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 11,
              background: "#ea580c",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            #1
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
            BuildRank
          </div>
          {category && (
            <div
              style={{
                display: "flex",
                marginLeft: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: "#262626",
                color: "#d4d4d4",
                fontSize: 20,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#ffffff",
              maxWidth: 1000,
            }}
          >
            {name}
          </div>
          {tagline && (
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 30,
                color: "#a3a3a3",
                maxWidth: 950,
              }}
            >
              {tagline}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          {rank && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 20, color: "#a3a3a3" }}>Rank</div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#ea580c" }}>
                {rank}
              </div>
            </div>
          )}
          {totalPaid && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 20, color: "#a3a3a3" }}>Total paid</div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#ffffff" }}>
                {totalPaid}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
