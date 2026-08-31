import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit your project",
  description:
    "List your product on BuildRank for $1. Pay to rank higher, get outbid and lose the spot — rank is decided purely by total paid.",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
