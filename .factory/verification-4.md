# Independent verification 4 — Line Take Match

## Verdict: PASS

**Finding count: 0. Untested claim count: 0.**

Verified on 2026-09-06 UTC against the implementation candidate
`3c02de9b2659623f80a97e27f643a85cf337b62a` and the live product at
<https://line-take-match.sociobot.in>. The later documentation commit is
`6aa91f876db8f9d3f290fa58a33b77033a738213`; it contains no product-image
change. No product code was modified for this verification.

## What the product does

Line Take Match is for indie animators and game creators who need to compare
recorded character-line takes with an approved take. The first action is **Try
it with sample data**; it opens three isolated dialogue takes to compare.

Fresh 390×844 phone and 1440×960 desktop browser contexts both showed that
job, audience, and action before scrolling. Both had the correct root title,
no console errors, and the first action inside the viewport. Opening the demo
showed three populated takes, the persistent **Demo — sample data, nothing is
saved** label, **Reset demo**, and **Start for real**.

## Clean candidate checks

Fresh detached checkout: `/tmp/line-take-match-verify4.zOxed3/repo` at
`3c02de9`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; lockfile install completed with 0 vulnerabilities. |
| `npm test` | PASS; 13/13 tests. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS; generated `dist/`. Main JS is 11.53 KiB gzip and main CSS is 5.25 KiB gzip. |
| Every exact claim command in `.factory/claims.json` | PASS; 17/17 commands were run independently. |
| `npm run test:claims` | PASS; 17/17 browser claim tests. |
| `npm run test:e2e -- --workers=1` | PASS; 62/62 browser tests. Playwright recorded `status: passed`, with no failed tests. |
| `/opt/fleet/lib/verify-url.sh` on the live root | PASS; 200 response, title, `lang=en`, one h1, main landmark, image alt text, named buttons, and no console errors. |

## Public claims

Every registered claim has exactly one matching claim test, and each declared
command passed from the clean checkout.

| Claim id | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `local-private` | PASS |
| `no-voice-services` | PASS |
| `offline-reload` | PASS |
| `filename-grouping` | PASS |
| `comparison-cues` | PASS |
| `csv-export` | PASS |
| `free-limit` | PASS |
| `studio-backup` | PASS |
| `billing-api` | PASS |
| `no-tracking` | PASS |
| `pwa-install` | PASS |
| `payment-isolation` | PASS |
| `license-storage` | PASS |
| `license-states` | PASS |
| `comparison-playback` | PASS |
| `data-removal` | PASS |

The public-page and README claim cross-check found every visitor-reliance
promise covered by this registry, including the repaired privacy-removal
promise. The current copy audit has no sentence above 22 words and no banned
marketing wording.

## Live product checks

- `npm run verify:live` passed from the clean candidate. It proved demo
  storage isolation, reset, leaving demo without touching a real sentinel,
  offline demo reload, route focus/announcement, invalid-license handling,
  manifest MIME type, and a 303 hosted Sociobot checkout redirect.
- Live routes returned the expected response/title pair: `/` 200, `/demo/`
  200, `/privacy/` 200, `/terms/` 200, and unknown `/not-a-real-page` 404
  with **Page not found** and a recovery link. The deliberate 404 was not
  treated as a defect.
- Playwright axe scans reported zero serious or critical issues on the live
  root, demo, legal routes, and 404. The full suite additionally covers
  keyboard skip/focus, route/back focus, 44px targets, mobile overflow, and
  reduced motion.
- The demo sample label remained present while editing; reset restored its
  initial sample and exiting cleared only `demo:line-take-match`. The real
  sentinel stayed in `line-take-match`.
- Link crawl: all product links returned 200, the checkout route returned its
  expected 303, and the external Sociobot contact link returned 200.
- Candidate artifact comparison: 29/29 deployed public artifacts matched
  `dist/` byte-for-byte. `staticwebapp.config.json` is intentionally not
  public and returned 404.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0.
- The product is a static local-first PWA. Backend tenant isolation, restart
  persistence, health checks, and 429/Retry-After allowances do not apply.

## Earlier findings disposition

| Earlier finding group | Current disposition |
| --- | --- |
| F-1-1 through F-1-8 | Fixed and rechecked: plain first screen, isolated demo, checkout, claims, real routes/404, skip focus, consistent words, and concise copy. |
| LTM-01 through LTM-08 | Fixed and rechecked: checkout, license safety, mutation/dialog focus, mixed imports, asset caching, touch targets, and skip destination. |
| F-2-1 through F-2-6 | Fixed and rechecked: complete outcome claims, no unlisted promise, route focus/announcement, comparison playback, literal controls, and clear format guidance. |
| F-3-1 through F-3-5 | Fixed and rechecked: populated first demo viewport, portable backup claim, singular count, control labels, and stable live focus verification. |
| F-5-1 | Fixed: `data-removal` is registered and its outcome test passed. |
| F-5-2 | Fixed: the deployed 404 uses direct **Page not found** recovery wording. |

## Evidence

The fresh live verifier wrote its browser evidence in the clean checkout at
`.factory/evidence/live/`; this report is copied to
`/work/.evidence/qa-report.md`. The result JSON is
`/work/.evidence/qa-result.json`.

No known verification gaps remain.
