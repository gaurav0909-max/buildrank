import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BuildRank — Pay to Rank. Get Discovered.";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#ea580c",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            #1
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: "#ffffff" }}>
            BuildRank
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#ffffff",
            maxWidth: 900,
          }}
        >
          Pay to Rank. Get Discovered.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            color: "#a3a3a3",
            maxWidth: 820,
          }}
        >
          The public pay-to-rank leaderboard. Submit anything, pay to rank
          higher, get outbid and lose the spot.
        </div>
      </div>
    ),
    { ...size }
  );
}
