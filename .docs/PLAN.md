# buildrank.lol — Build Plan

A near-identical (~95%) clone of outbid.lol's mechanic — submit, pay to rank, get outbid, lose the spot — pointed at one niche: **indie hackers, developers, and builders showing off what they made.** Submissions are GitHub projects, SaaS products, AI tools, Chrome extensions, mobile apps, portfolios, and open-source projects. Same core loop as the original, polished UI, real Stripe payments, an analytics layer the original doesn't publicly expose, and a category system fitted to this audience.

**The pitch, in one line:** pay → rank → get clicks → get discovered. Unlike a pure ego-board, everyone submitting here has a real reason to want the traffic — this is a launch/discovery channel, not just a flex.

**Distribution:** the target audience (indie hackers, devs, founders, SaaS/AI builders) is already the audience that made outbid.lol go viral on X — same crowd, same platform, so the original's launch playbook (post the leaderboard link, let people flex/defend rank) transfers directly.

**Stack:** Next.js (App Router) + SQLite (via Prisma) + Stripe Checkout, single deployable app.
**Location:** standalone project, separate from the `zeus` Expo app — its own folder, its own git history.

---

## 1. Core mechanic (the 95%)

This is the entire product. Get this right before anything else.

- **Submit a product**: name, URL, logo/image (upload or URL), one-line tagline, **category**.
- **Category** (fixed set, matches how builders already describe what they made): `GitHub Project`, `SaaS`, `AI Tool`, `Chrome Extension`, `Mobile App`, `Portfolio`, `Open Source`.
- **Bid to rank**: minimum bid $5, no maximum, no expiry.
- **Leaderboard**: one global list sorted by total amount paid, descending (#1 = highest paid), with **category filter tabs** at the top — global board is the default view, but each category has its own ranking view of the same data (no separate boards/tables, just a filtered sort).
- **Outbid**: if a new submission or an existing product's owner pays more than the current holder of a rank, they take that position immediately. No approval step — payment = rank, instantly, live.
- **Re-bid**: an existing product's owner can pay again at any time to climb further (their new bid amount becomes their new total rank position — clarify: is it cumulative spend or last-bid-wins? Recommend **cumulative total paid** per product, matching outbid.lol's model, since it produces the "escalating commitment" effect that made the original work).
- **No accounts required to submit or bid** — email only, for a receipt and to let the owner manage/re-bid their own entry (magic-link or simple owner-token in URL, no full auth system needed).
- **No expiry, no decay** — a paid rank holds forever unless outbid. (Explicitly not doing LastSpot's decay twist — 95% same, remember.)

## 2. Pages

| Page | Purpose |
|---|---|
| `/` | The leaderboard. Category filter tabs (All / GitHub / SaaS / AI Tool / Extension / Mobile App / Portfolio / Open Source), product rows sorted by total bid, live rank numbers, current price to beat shown per row, "Submit" and "Outbid #N" CTAs. |
| `/submit` | Form: name, URL, tagline, category, image upload, bid amount, email. Redirects to Stripe Checkout. |
| `/product/[id]` | Single product detail — bid history, current rank (global + within category), "outbid this" CTA, click-through link. |
| `/about` | What this is, how the mechanic works, FAQ (why pay, what "outbid" means, refund policy). |
| `/stats` | **Public analytics page** (the content addition) — total revenue, total visitors, total products, price of #1 over time, a simple live activity feed ("X just bid $Y"). |
| `/admin` (auth-gated, owner only) | **Private analytics dashboard** — revenue over time, conversion funnel (visits → submit form starts → completed payments), top referrers, per-product click-through counts, DDoS/traffic spike monitoring. |

## 3. UI / design direction

Good UI, not flashy — this is a utility page people check repeatedly, not a landing page.

- Real-time feel: rank changes and price updates should animate (row slides up/down, brief highlight flash) rather than hard-refresh. Use polling (every 5–10s) or a lightweight websocket/SSE channel for the live leaderboard — SSE is enough at this scale and avoids websocket infra.
- Tabular numbers everywhere bids/ranks are shown (`font-variant-numeric: tabular-nums`) so amounts don't jitter as digits change width.
- Clear "price to beat" on every row so the CTA is obvious: "Outbid for $X+".
- Mobile-first — most traffic on a viral launch arrives from X/Twitter on a phone.
- Dark and light theme support.
- Empty state for a fresh leaderboard (first submitter becomes #1 automatically) with a clear "be the first" CTA.

## 4. Data model (Prisma / SQLite)

```
Product
  id            String  @id @default(cuid())
  name          String
  url           String
  tagline       String
  imageUrl      String
  ownerEmail    String
  ownerToken    String  @unique   // lets owner re-bid without full auth
  category      String             // github | saas | ai_tool | extension | mobile_app | portfolio | open_source
  totalPaid     Int                // in cents, cumulative — this is the rank sort key
  createdAt     DateTime @default(now())

Bid
  id            String  @id @default(cuid())
  productId     String
  amount        Int                // cents
  stripeSessionId String @unique
  status        String             // pending | paid | failed
  createdAt     DateTime @default(now())

VisitEvent        // for /stats and /admin analytics
  id            String @id @default(cuid())
  type          String   // page_view | product_click | submit_start | submit_complete
  productId     String?
  createdAt     DateTime @default(now())
```

## 5. Payment flow (real Stripe Checkout)

1. User fills submit/bid form → server creates a `Bid` row with `status: pending` and a Stripe Checkout Session (amount = their bid, in the product's currency).
2. Redirect to Stripe-hosted Checkout page — no card data touches our server.
3. **Stripe webhook** (`checkout.session.completed`) is the only source of truth for a paid bid:
   - Mark `Bid.status = paid`.
   - Increment `Product.totalPaid` by the bid amount.
   - Recompute leaderboard order (just a sort on `totalPaid`, no separate rank column needed).
4. Success page confirms new rank; failure/cancel returns to `/submit` with the amount preserved.
5. **Never trust the client-side redirect alone to grant rank** — only the webhook write counts, or people fake success URLs to jump the board for free.

Requires: your own Stripe account + API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) in `.env`. Test in Stripe test mode first; flip to live keys only after a full dry run.

## 6. Analytics (the other addition beyond "95% same")

- Log a `VisitEvent` on: page view, product link click, submit-form start, submit-form complete (paid).
- `/stats` (public): total revenue, total visitors, total products, current #1 + price, a simple sparkline of price-of-#1 over time, live "last N bids" ticker, **submissions and revenue broken down by category** (which category is hottest is itself shareable content — "AI Tools is the most competitive category right now").
- `/admin` (private): everything above plus conversion funnel (view → start → complete), per-product click-through rate, revenue by day, **revenue and CTR by category**, top traffic referrers (from `document.referrer` / UTM params), and a simple rate-limit/traffic alert (spike detector) given outbid.lol reportedly got hit with traffic surges/DDoS at peak.

## 7. Build order

1. **Scaffold**: Next.js app, Prisma + SQLite, base layout, theme tokens.
2. **Core loop, no payments yet**: submit form → DB row → leaderboard renders sorted by a manually-set `totalPaid` (seed test data). Get the live-update UI feeling right before wiring money.
3. **Stripe integration**: checkout session creation, webhook handler, rank updates only on confirmed webhook.
4. **Live leaderboard updates**: SSE/polling so rank changes appear without a manual refresh.
5. **Analytics logging**: event tracking wired into every relevant action.
6. **`/stats` public page** and **`/admin` dashboard**.
7. **`/about` + content pass**: FAQ, refund policy, OG/share image so links posted on X render a nice card (this matters a lot for the original's virality — don't skip it).
8. **Polish pass**: empty states, error states, mobile check, dark/light theme check, loading states during Stripe redirect.
9. **Deploy**: Vercel (or similar) + swap Stripe to live keys + move SQLite to a hosted/persistent volume or switch to Postgres if traffic is expected to spike hard (SQLite is fine to start, but a genuine viral spike like the original saw will want Postgres — flag this as a fast follow-up, not a blocker to launch).
10. **Launch on X**: seed the board yourself first (submit 5–10 real indie projects, your own included, at small bids) so it's never empty on arrival. Post the link framed as "pay to rank your [SaaS/AI tool/extension] — get seen by devs" rather than a generic leaderboard announcement, credit outbid.lol as the inspiration, and reply to your own post when someone gets outbid to keep the thread alive — that's the mechanic doing the marketing, same as the original.

## 8. Explicitly not doing (keeping this 95%, not reinventing)

- No decay mechanic (that's LastSpot's twist).
- No takeover format, no charity split, no daily-reset auction — plain leaderboard + category filter, same shape as the original.
- No user accounts/login system — owner-token-in-URL is enough, matches the original's low-friction feel.
- No AI judging, no gamified extras — the mechanic itself is the whole product. (The one deliberate scope addition beyond "95% same" is the fixed category set below, since it's what makes this a discovery tool for builders instead of a pure ego-board.)

---

**Next step once this plan is approved:** scaffold the Next.js project in a new folder and implement section 7, step 1–2, so the leaderboard UI (with category tabs) can be reviewed with seed data before Stripe keys are needed.
