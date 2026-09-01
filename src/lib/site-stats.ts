import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const WATCHING_WINDOW_MS = 90_000; // presence considered "live" if seen in the last 90s

export type HeaderStats = {
  totalRevenue: number;
  uniqueVisitors: number;
  watchingNow: number;
  daysSinceLaunch: number;
};

async function computeHeaderStats(): Promise<HeaderStats> {
  const [revenueAgg, visitorGroups, firstVisit, watchingNow] = await Promise.all([
    prisma.product.aggregate({ _sum: { totalPaid: true } }),
    prisma.visitEvent.groupBy({
      by: ["visitorId"],
      where: { type: "page_view", visitorId: { not: null } },
    }),
    prisma.visitEvent.aggregate({ _min: { createdAt: true } }),
    prisma.presence.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - WATCHING_WINDOW_MS) } },
    }),
  ]);

  const launchDate = firstVisit._min.createdAt ?? new Date();
  const daysSinceLaunch = Math.max(
    1,
    Math.ceil((Date.now() - launchDate.getTime()) / (24 * 60 * 60 * 1000))
  );

  return {
    totalRevenue: revenueAgg._sum.totalPaid ?? 0,
    uniqueVisitors: visitorGroups.length,
    watchingNow,
    daysSinceLaunch,
  };
}

export const getHeaderStats = unstable_cache(computeHeaderStats, ["header-stats"], {
  revalidate: 30,
});
