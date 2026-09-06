# Line Take Match — review 6 handoff

## Outcome

**FAIL.** One minor finding remains; there are zero untested public claims.

- Implementation reviewed: `3c02de9b2659623f80a97e27f643a85cf337b62a`
- Documentation reviewed: `3dad31571b8ac38f2e28093598fb11de13154df9`
- Live URL: <https://line-take-match.sociobot.in>
- Full QA report: `.factory/review-6.md`

## What was verified

- Clean install, 13 unit tests, typecheck, build, all 17 individual claim
  commands, 17 aggregate claim tests, and 62 browser tests passed.
- Fresh phone and desktop visits showed the job, audience, and sample action
  before scrolling. The sample is populated, visibly labelled, resettable,
  offline-capable, and isolated from real storage.
- Live routes, designed 404, legal pages, keyboard/focus, reduced motion,
  accessibility, privacy, link crawl, expected hosted checkout redirect, PWA
  behavior, and 29/29 byte-identical deployed artifacts passed. Lighthouse
  scored 100/100/100/100.
- Earlier findings, including the review-5 removal claim and 404 wording, are
  now closed.

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

Open the isolated sample at
<https://line-take-match.sociobot.in/?demo=1>. The product is a static PWA;
backend tenant, restart, health, and rate-limit checks do not apply.

## Known gap

F-6-1: `/offline.html` says **“The stall is offline.”** and **“Try the
takeboard again.”** Replace this metaphor copy with direct offline recovery
language. No product code was changed during this review.
