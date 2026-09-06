# Line Take Match — review 7 handoff

## Outcome

**FAIL. Finding count: 1. Untested claim count: 0.**

Review 7 found one minor touch-target defect. On a 390 × 844 phone, the 404
recovery link measures 176.2 × 19 px, the temporary Undo action measures
58.8 × 32 px, and the Privacy contact link measures 186.6 × 19 px. The product
contract requires 44 × 44 px touch targets. Full evidence and the requested
fix are in `.factory/review-7.md`.

- Implementation reviewed: `44803891c20dd53276d0babd6ad432777e3fc1cc`
- Documentation baseline: `c7034099157b79fe7868292440c0bb4b70524ea0`
- Live app: <https://line-take-match.sociobot.in>

No product code was changed during this review.

## What passed

- Fresh phone and desktop first screens state the job, audience, and first
  action before scrolling.
- The one-click sample opens three populated takes, stays labeled, resets,
  clears on exit, remains separate from real data, and reloads offline.
- All 17 exact declared claim commands passed independently. The aggregate
  claim suite passed 17/17, with no untested public claim.
- Unit tests passed 13/13. Type checking and the production build passed.
- The full desktop and phone browser suite passed 64/64.
- The live verifier passed routes, demo, offline behavior, checkout, focus,
  console, and Axe checks.
- The direct offline page passed `verify-url.sh` and returned to the app.
- A service-worker replacement displayed the update notice.
- All 29 public live artifacts matched the clean build byte for byte.
- Live Lighthouse scored 100/100/100/100. FCP was 0.9 s, LCP 1.2 s, TBT 60 ms,
  CLS 0, and total transfer 57 KiB.

The static PWA has no backend. Tenant isolation, server restart persistence,
health endpoints, and 429/Retry-After checks do not apply.

## How to verify

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:claims
npm run test:e2e -- --workers=1
npm run verify:live
```

Open the live site at 390 px, visit a missing route, and measure **Go to Line
Take Match**. In the demo, remove a take and measure **Undo**. Also measure the
Privacy page's **Sociobot (external site)** link. Each needs a 44 px effective
touch height and a regression test before another PASS review.
