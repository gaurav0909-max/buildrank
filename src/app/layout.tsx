import type { Metadata } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
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
    "The public leaderboard for indie hackers and developers. Submit your SaaS, AI tool, Chrome extension, mobile app, GitHub project, portfolio, or open-source project. Pay to rank higher, get outbid, get clicks.",
  keywords: [
    "indie hackers",
    "launch platform",
    "product leaderboard",
    "pay to rank",
    "developer directory",
    "SaaS directory",
    "AI tools directory",
    "startup launch",
  ],
  authors: [{ name: "BuildRank" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "BuildRank",
    title: "BuildRank — Pay to Rank. Get Discovered.",
    description:
      "The public leaderboard for indie hackers and developers. Pay to rank, get outbid, get clicks.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BuildRank" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildRank — Pay to Rank. Get Discovered.",
    description:
      "The public leaderboard for indie hackers and developers. Pay to rank, get outbid, get clicks.",
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
  description:
    "The public pay-to-rank leaderboard for indie hackers and developers.",
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
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
