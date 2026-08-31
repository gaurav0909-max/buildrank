import type { Metadata } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PageViewBeacon from "@/components/page-view-beacon";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildrank.lol";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BuildRank — Pay to Rank. Get Discovered.",
    template: "%s · BuildRank",
  },
  description:
    "The public pay-to-rank leaderboard. Submit anything, pay to rank higher, get outbid and lose the spot. #1 gets seen by everyone who visits.",
  keywords: [
    "leaderboard",
    "launch platform",
    "pay to rank",
    "outbid",
    "product directory",
    "startup launch",
  ],
  authors: [{ name: "BuildRank" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "BuildRank",
    title: "BuildRank — Pay to Rank. Get Discovered.",
    description:
      "The public pay-to-rank leaderboard. Pay to rank, get outbid, get clicks.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BuildRank" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildRank — Pay to Rank. Get Discovered.",
    description:
      "The public pay-to-rank leaderboard. Pay to rank, get outbid, get clicks.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BuildRank",
  url: siteUrl,
  description: "The public pay-to-rank leaderboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PageViewBeacon />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
