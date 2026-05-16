## Pricing Strategy

**$100 per seat per month. Monthly billing. No free tier. No annual contracts (pilot stage).**

**What the user sees:** $100/seat/month for full product access. AI usage is "included for typical use." Heavy users can raise their overage cap to keep going. No mention of tokens or specific limits on the pricing page.

**What happens internally:**

- $20/seat/month of the subscription is an implicit AI allowance, denominated in gateway cost (i.e., the seat gets $20 worth of actual inference before the wall).
- $80/seat/month is product margin — covers hosting, billing, sales/support, dev time, profit.
- AI allowance resets every billing cycle. No rollover.
- When the allowance is depleted, overages are auto-billed to the card on file, up to a per-user monthly cap.

**Overage handling:**

- Priced at 1.5x gateway cost.
- Auto-recharged to card on file — no manual top-ups.
- **Per-user cap, default $50/month overage** (user-adjustable in settings).
- When cap is hit: **hard wall**. AI stops. User sees a "raise your cap" CTA.

**Usage visibility:**

- Settings page surfaces current cycle usage in dollars, e.g. `$14 of $20 included used this cycle` plus `$0 of $50 overage cap`.
- No token counts, no model names. Gateway cost in dollars only.

**Request flow:**

1. Check monthly allowance. If sufficient, reserve against it.
2. If allowance is depleted, check remaining room under the overage cap. If room exists, reserve against it.
3. If cap is reached, reject with a "raise your cap" CTA.
4. After generation completes, settle against actual cost from `getGenerationInfo()`.

**Seat management:**

- Add a seat mid-cycle → full-month charge, full $20 allowance.
- Remove a seat mid-cycle → no refund, access continues to end of cycle.

**Non-AI users:** Pay $100/month/seat, use product, never touch AI. Full margin retained. Flag as a churn-risk signal — a paying seat not using the core differentiator is worth a check-in, not a celebration.

**Cancellation:** Subscription runs to end of billing period. Unused monthly allowance is forfeit. No refunds.

**What you're committing to build:**

- Stripe subscription billing (per-seat, monthly).
- Two balance concepts per user: monthly allowance (resets) and overage spend (capped, auto-billed).
- Per-user overage cap setting with default of $50.
- Reservation + settlement system against `getGenerationInfo()`.
- Daily reconciliation against `getSpendReport()` with drift alerting (>5% triggers Sentry/Slack).
- In-product usage visibility in settings.
- Seat add/remove flows with the semantics above.

**What you're explicitly not building (for now):**

- Free tier.
- Multiple subscription tiers.
- Annual contracts.
- Manual top-up wallets.
- Token-based pricing displayed to users.
- Mid-cycle refunds.
- Firm-level admin roles / shared caps (per-user only for now).
