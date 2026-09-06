# Verify comparing recorded voice takes — Line Take Match

## Verdict: PASS

**PASS.** Finding count: **0**. Untested claim count: **0**.

This independent check reviewed product implementation
`44803891c20dd53276d0babd6ad432777e3fc1cc`. The documentation and test-evidence
tip was `ac1f14a28444bf24d967eed9e3862b008ee889e2`. The commits after the
implementation change only verification, handoff, and evidence files; a clean
build's 29 public files match the live deployment byte-for-byte.

Live URL: <https://line-take-match.sociobot.in>

## First screen

Fresh 390 × 844 phone and 1440 × 960 desktop browser contexts started at scroll
position zero with no console errors. Before scrolling, each showed:

- Job: **Compare voice takes with an approved take.**
- Audience: **indie animators and game creators** checking recorded character
  lines.
- First action: **Try it with sample data**. The nearby sentence says it opens
  three dialogue takes to compare.

Both contexts kept all three items inside the first viewport. The phone and
desktop screenshots are recorded in the verification evidence generated from
the clean checkout.

## Real product path

The one-click sample opened three named `door warning` takes with an approved
take, level difference, four review cues, and approved-then-candidate playback.
The persistent banner identifies it as sample data and offers Reset demo and
Start for real. Editing a sample, resetting it, and leaving it worked. A
sentinel inserted into the normal IndexedDB database survived the demo; demo
rows were cleared on exit. The sample also reloaded with the browser offline
after service-worker control.

Normal, invalid, boundary, and recovery paths were covered by the 64 browser
tests: valid and invalid license states, free 12-take boundary, Studio's
13-take path and audio backup restore, unsupported/corrupt import feedback,
remove/undo and site-data removal, keyboard focus after board changes, route
focus, reduced motion, and the direct offline recovery route. The live offline
page says **You’re offline**, gives direct recovery steps, and its 44px
**Try again** link returned to the app.

## Declared claims

All 17 exact commands listed in `.factory/claims.json` ran individually from a
fresh clone after `npm ci`. Every command passed its one tagged observable test.
The aggregate `npm run test:claims` also passed all 17. There are no missing,
false, incomplete, or untested registry claims.

The checks cover demo isolation, local processing, no voice services, offline
reload, filename grouping, comparison cues, CSV export, free and Studio
limits, billing routes, no tracking, PWA installability, payment isolation,
license storage and invalid states, comparison playback, and data removal.
The landing, README, privacy, terms, and footer copy was cross-checked against
that registry. No additional visitor-reliance claim was found without a test.

## Commands and live evidence

| Check | Result |
| --- | --- |
| Clean `npm ci` | PASS; 60 packages, 0 vulnerabilities |
| `npm test` | PASS; 13 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; `dist/` produced |
| Every `.factory/claims.json` command | PASS; 17 of 17 individually |
| `npm run test:claims` | PASS; 17 tests |
| `npm run test:e2e -- --workers=1` | PASS; 64 tests; Playwright last-run status `passed` |
| `npm run verify:live` | PASS; fresh phone and desktop, demo, offline, routes, checkout, and axe scans |
| Live link crawl | PASS; internal links 200, checkout 303 to the hosted merchant page, external contact link 200 |
| Public artifact comparison | PASS; 29 of 29 public files byte-for-byte; deployment config is intentionally not publicly served |
| Live Lighthouse | PASS; performance 100, accessibility 100, best practices 100, SEO 100 |

The independent Lighthouse run measured FCP 1.0 s, LCP 1.2 s, TBT 0 ms, and
CLS 0. Initial app JavaScript is 11.53 KiB gzip and CSS is 5.25 KiB gzip.

`npm run verify:live` found zero console errors. Axe reported zero serious or
critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, `/not-a-real-page`,
and `/offline.html`. The not-found route deliberately returned HTTP 404 with a
designed recovery page; that is expected behavior, not a defect. Every checked
route had the required unique title, one h1, main landmark, and canonical URL.
The live headers supplied CSP, no-sniff, strict referrer policy, restrictive
permissions policy, and immutable caching for hashed assets.

## Earlier findings

All earlier review and verification findings were inspected and are closed:

| Earlier items | Current proof |
| --- | --- |
| LTM-01; F-1-3 | Production Studio checkout returned 303 to the hosted merchant page; invalid verification was rejected. |
| LTM-02, LTM-04; F-2-1, F-2-2, F-5-1 | License tests cover unverified-network failure, in-dialog errors, storage, invalid/revoked/expired/wrong-product states, and the previously missing privacy-control claim. |
| LTM-03, LTM-08; F-1-6, F-2-3 | Skip, route, and post-mutation focus tests passed. |
| LTM-05, LTM-07; F-2-5, F-2-6, F-3-3, F-3-4 | Browser tests cover mixed-import feedback, 44px targets, direct action names, format recovery, and singular/plural output. |
| LTM-06 | Live hashed assets returned immutable one-year caching headers. |
| F-1-1, F-1-7, F-1-8 | Fresh first-screen check and copy audit found a plain job, named audience, visible first action, and no remaining metaphor or terminology issue. |
| F-1-2, F-3-1; F-2-4 | The demo opens populated in one click, stays separate from real data, and has one-action comparison playback. |
| F-1-4, F-2-1, F-2-2, F-3-2; F-5-1 | The claim registry is complete and every listed command passed independently. |
| F-1-5; F-2-3 | Public routes, metadata, focus announcements, legal pages, sitemap, and designed 404 all passed live checks. |
| F-3-5 | The documented live verifier completed without its former route-focus race. |
| F-5-2 | The 404 page now says “Page not found” and “This address does not match a page.” |
| F-6-1 | The offline fallback now says “You’re offline” and “Try again”; its recovery outcome passed on phone and desktop. |

Backend-only checks for tenant isolation, restart persistence, health, and
429/Retry-After do not apply: this product is a static, local-first PWA with no
product backend. No product code was changed during this verification.
