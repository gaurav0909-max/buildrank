# BuildRank — Session Handoff

Where things stand, and the exact commands to resume. Read this first when you (or Claude) come back to this project.

**Project folder:** `d:\realme\OneDrive\Desktop\buildrank`
**Original plan:** [`.docs/PLAN.md`](./PLAN.md) — read that for the full product spec (mechanic, data model, page list, Stripe flow). This doc is just "what's actually been built" + "what to do next."

---

## 1. What's built

A working Next.js app implementing the plan: a pay-to-rank leaderboard for indie hackers/developers (`buildrank.lol`), styled with your Color Hunt palette (`#3368A0 / #66A3BF / #C8DFDB / #F2EFE7`), real Stripe Checkout wiring, and SEO metadata.

### Stack
- Next.js (App Router, TypeScript, Tailwind v4) — scaffolded via `create-next-app`
- Prisma + SQLite for the database
- Stripe Checkout for payments (test keys not yet added — see §3)
- Fonts: Sora (display/headings), Manrope (body), JetBrains Mono (bid amounts, ranks) — loaded via `next/font/google`

### File map
```
src/
  app/
    page.tsx                     Home — the leaderboard (category tabs, stat strip, rows)
    layout.tsx                   Fonts, metadata, JSON-LD, Header/Footer
    globals.css                  Design tokens — light + dark theme, both fully defined
    submit/page.tsx              Submit / outbid form → posts to /api/checkout
    about/page.tsx                How-it-works + FAQ
    stats/page.tsx                Public stats — revenue by category, recent bids
    product/[id]/page.tsx        Single product detail page
    checkout/success/page.tsx    Post-payment confirmation
    api/checkout/route.ts        Creates Stripe Checkout Sessions (new submission or outbid)
    api/webhooks/stripe/route.ts Stripe webhook — the ONLY place rank actually updates
    sitemap.ts / robots.ts       SEO
  components/
    header.tsx / footer.tsx / category-tabs.tsx / leaderboard-row.tsx
  lib/
    prisma.ts                    Prisma client singleton
    stripe.ts                    Stripe client (throws clearly if key missing)
    categories.ts                The 7 fixed categories + formatUsd helper
prisma/
  schema.prisma                  Product / Bid / VisitEvent models
  seed.mjs                       Seeds 7 sample projects (one per category) with realistic bid history
.env                              DATABASE_URL set; Stripe keys are BLANK — you must add your own
```

### Design decisions worth knowing
- **Rank = cumulative total paid per product**, not last-bid-wins — matches outbid.lol's model (escalating commitment is the whole point).
- **The webhook is the only source of truth** for rank changes (`api/webhooks/stripe/route.ts`) — the client-side success redirect never grants rank on its own, so no one can fake a win.
- **7 fixed categories**: GitHub Project, SaaS, AI Tool, Chrome Extension, Mobile App, Portfolio, Open Source. Leaderboard is one global list with category filter tabs, not separate boards.
- **No user accounts** — an `ownerToken` (UUID) per product is the intended mechanism for owners to manage their listing later; that management UI hasn't been built yet (see §4).
- Both light and dark themes are fully implemented in `globals.css` (system preference + explicit override support).

---

## 2. Current blocker — Prisma version

`npm install` resolved `prisma`/`@prisma/client` to **8.0.0-rc.10**, which turned out to be a release-candidate CLI with a completely different command set (no `prisma generate` / `prisma db push` — it's been rebuilt around `prisma orm`, `prisma contract`, `prisma dev`, etc.). That breaks the classic workflow this schema was written for.

**Fix in progress:** pinning both packages to the last stable release, `7.10.0`:
```
npm install prisma@7.10.0 @prisma/client@7.10.0
```
This was kicked off in the background and may or may not have finished — check `package.json` to confirm the version before continuing:
```
cat package.json   # look for "prisma" / "@prisma/client" under dependencies/devDependencies
```
If it still shows `8.0.0-rc.10` or the install didn't complete, re-run the pin command above first.

---

## 3. Exact steps to resume

Run these **in order**, from `d:\realme\OneDrive\Desktop\buildrank`:

```bash
# 1. Confirm/finish the Prisma downgrade (see §2)
npm install prisma@7.10.0 @prisma/client@7.10.0

# 2. Generate the Prisma client
npx prisma generate

# 3. Create the SQLite database from the schema
npx prisma db push

# 4. Seed 7 sample listings (safe to re-run — will duplicate if run twice, so only run once per fresh db)
node prisma/seed.mjs

# 5. Start the dev server
npm run dev
```

Then open **http://localhost:3000** — you should see the leaderboard with 7 seeded products, category tabs, and live stats at `/stats`.

**Note on install speed:** this project lives inside OneDrive (`Desktop\buildrank`), and OneDrive's real-time sync noticeably slows down `npm install` (one install took ~15 minutes that should take ~1–2). If you want faster installs going forward, consider excluding `node_modules` from OneDrive sync, or moving the project outside the OneDrive-synced folder.

### Before accepting real payments
The `/submit` flow will fail at the Stripe step until you add real keys to `.env`:
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```
Get test-mode keys from your Stripe Dashboard, and for local webhook testing use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. Test the full submit → pay → webhook → rank-updates loop in test mode before ever switching to live keys.

---

## 4. What's not built yet (in rough priority order)

1. **Owner re-bid / manage-listing flow** — the `ownerToken` field exists on `Product` but there's no page yet that lets an owner use it to re-bid or edit their listing (plan called for "owner-token-in-URL, no full auth").
2. **`/admin` private analytics dashboard** — `/stats` (public) is done; the private admin view (conversion funnel, referrers, traffic-spike alerting) from the plan is not.
3. **OG share image** — `layout.tsx` references `/og.png` but that file doesn't exist yet; social shares will currently have a broken image.
4. **Real image upload for submissions** — `/submit` currently takes a logo *URL* only (auto-generates a DiceBear avatar if left blank); no actual file upload.
5. **Live-updating leaderboard** — currently revalidates every 10s (`revalidate = 10` in `page.tsx`); the plan's SSE/live-push version hasn't been built.
6. **Deploy** — nothing's been pushed anywhere yet. Plan recommends Vercel; will need Postgres instead of SQLite once deployed unless using a persistent-volume host, since SQLite + serverless don't mix well.
7. **Domain** — `buildrank.lol` is not yet registered. Rough pricing researched: ~$1–2 first year promo, ~$25–26/year renewal (e.g. Porkbun). Recommended over GoDaddy (weaker consumer ToS as of Feb 2026).

---

## 5. To resume this conversation with Claude Code

Open a terminal in `d:\realme\OneDrive\Desktop\buildrank` (not the `zeus` folder — this is a separate project) and start Claude Code there, or point your existing session at this directory. Mention "buildrank" and this handoff doc and it'll have full context on what's done and what's next.
