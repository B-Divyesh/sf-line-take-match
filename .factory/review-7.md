# Review 7 — compare recorded voice takes

## Verdict: FAIL

**Finding count: 1. Untested claim count: 0.**

Reviewed on 2026-09-06 UTC at
<https://line-take-match.sociobot.in>. The implementation candidate is
`44803891c20dd53276d0babd6ad432777e3fc1cc`. The documentation commit reviewed
is `c7034099157b79fe7868292440c0bb4b70524ea0`. Later changes affect only
verification code, reports, and evidence. A clean build matched all 29 public
live files byte for byte.

The requested authoritative path
`factory-evidence/line-take-match-verify-5/qa-report.md` was not mounted in
this worker. The complete committed `.factory/verification-5.md` report was
read instead, together with every earlier review, verification, polish report,
the brief, design record, demo record, copy audit, claims registry, and handoff.

## Job, audience, and first action

Fresh browsers opened at scroll position zero with no stored data:

| View | Job | Audience | First action |
| --- | --- | --- | --- |
| 390 × 844 phone | Compare voice takes with an approved take. | Indie animators and game creators checking recorded character lines. | **Try it with sample data**; the next sentence says it opens three dialogue takes. |
| 1440 × 960 desktop | Compare voice takes with an approved take. | Indie animators and game creators checking recorded character lines. | **Try it with sample data**; the next sentence says it opens three dialogue takes. |

All three answers were visible before scrolling. Each view had one h1, the
correct title, no horizontal overflow, and no console error.

## Finding

### F-7-1 / LTM-07 reopened — MINOR — Some phone touch targets are shorter than 44 px

At a 390 × 844 phone viewport, fresh live measurements found these interactive
targets below the required 44 px height:

| Route or state | Control | Measured size |
| --- | --- | ---: |
| Unknown route | **Go to Line Take Match** | 176.2 × 19 px |
| After removing a sample take | **Undo** | 58.8 × 32 px |
| Privacy | **Sociobot (external site)** | 186.6 × 19 px |

The 404 response itself is correct and expected. The defect is that its only
recovery action has a narrow touch area. The Undo action is also time-limited,
so its 32 px height makes recovery harder on a phone. The Privacy link is an
inline link, but the supplied product contract requires touch targets to be at
least 44 × 44 CSS px without an inline-text exception.

The current browser regression checks only the home and legal navigation links.
It does not inspect the 404 action, Privacy contact link, or Undo action.

Fix these controls with at least a 44 px effective hit area, preserving visible
focus and spacing. Add a phone regression that opens the 404 page, removes a
demo take to show Undo, and measures every actionable target on the legal and
recovery states.

## Demo and data isolation

The one-click sample passed its intended workflow. It opened three realistic
`door warning` takes with one approved take, four review cues, one review flag,
notes, waveforms, CSV export, and approved-then-candidate playback. The sample
comparison was visible in the first phone and desktop demo viewport.

The persistent banner says **Demo — sample data, nothing is saved to your take
list** and provides **Reset demo** and **Start for real**. Editing then resetting
a sample restored the original data. A sentinel inserted into the normal
`line-take-match` IndexedDB database survived demo reset and exit. Demo rows in
`demo:line-take-match` were cleared on exit. The sample also reloaded while the
browser was offline. No real user data was accessed.

## Declared claims

All 17 exact commands in `.factory/claims.json` ran independently after
`npm ci` in a clean detached checkout. Every command passed its one tagged
outcome test. The aggregate claim suite also passed 17/17.

| Claim | Result |
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

The live landing, demo, Privacy, Terms, offline page, and README were checked
against the registry. No missing, false, incomplete, or untested public claim
was found. Each claim id occurs exactly once in the source claim tests.

## Normal, invalid, boundary, and recovery paths

The 64-test browser suite passed on desktop and phone. It covered imports,
grouping, measurements, approved takes, comparison playback, flags, notes,
persistence, CSV export, missing consent, corrupt and mixed imports, the
12-take free boundary, 13 Studio takes, backup restoration in a clean browser,
invalid and unreachable license checks, checkout return handling, route and
mutation focus, offline reload, and data removal.

A separate local service-worker replacement check displayed **Update ready.
Reload to use it.** while the page remained controlled. The direct offline
page said **You’re offline**, and **Try again** returned to the app.

## Accessibility, privacy, routes, and delivery

- Axe found zero violations of any impact on root, demo, Privacy, Terms, the
  deliberate 404, and the offline page at phone size. The touch-size finding
  above is a manual requirement failure not reported by Axe.
- Reduced motion produced `scroll-behavior: auto`, a maximum animation or
  transition duration of `0.00001s`, and no overflow.
- Skip-link focus, internal navigation, browser Back, dialog feedback, and
  focus after take-list changes passed. The dialog has a named close action.
- Root, demo, Privacy, Terms, and offline returned 200 with unique titles.
  The designed unknown route correctly returned HTTP 404 with **Page not
  found**. The 404 status is expected and is not itself a finding.
- The link crawl found successful internal and contact destinations. Checkout
  returned the expected 303 to the hosted payment page. The only other 404 was
  the current-page skip link on the deliberate not-found route.
- Live request checks found no analytics, trackers, remote fonts, transcription,
  generation, or audio uploads. The optional license request uses the stated
  Sociobot product route.
- Root and service-worker responses use `no-cache`. Hashed assets use one-year
  immutable caching. Security headers include CSP, HSTS, frame denial,
  no-sniff, referrer policy, permissions policy, COOP, and CORP.
- The PWA has the required standalone manifest, versioned start URL, 192 px and
  512 px icons, maskable icon declaration, controlled service worker, offline
  data persistence, CSV export, and Studio backup import/export.
- The visual system remains the recorded single dark treatment: booth artwork,
  near-black surfaces, paper text, cyan focus and measurements, pink selection,
  amber review states, and reduced motion.

This product is a static local-first PWA. Backend tenant isolation, restart
persistence, health endpoints, and 429/Retry-After behavior do not apply. No
AI feature is missing: remote inference would conflict with the brief's local,
consent-safe human-performance review boundary.

## Clean and live evidence

Fresh detached checkout:
`/tmp/line-take-match-review7.PAh4Sd/repo` at documentation SHA `c703409`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 60 packages, 0 vulnerabilities |
| `npm test` | PASS; 13/13 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; `dist/` produced |
| Every exact claim command | PASS; 17/17 independently |
| `npm run test:claims` | PASS; 17/17 |
| `npm run test:e2e -- --workers=1` | PASS; 64/64 |
| `npm run verify:live` | PASS; fresh phone/desktop, demo, offline, routes, checkout, and Axe |
| `verify-url.sh` on root and offline page | PASS; no console errors |
| Public artifact comparison | PASS; 29/29 byte-for-byte |
| Live Lighthouse | PASS; 100 performance, 100 accessibility, 100 best practices, 100 SEO |

Lighthouse measured FCP 0.9 s, LCP 1.2 s, TBT 60 ms, CLS 0, and 57 KiB total
transfer. The production build emits 11.53 KiB gzip application JavaScript and
5.25 KiB gzip application CSS.

## Earlier findings

Every earlier review and verification finding was checked against current live
behavior and the clean suites:

| Earlier finding group | Current disposition |
| --- | --- |
| F-1-1 through F-1-8 | Closed: plain first screen, isolated demo, checkout, claim registry, routes, skip focus, terms, and concise copy pass. |
| LTM-01 through LTM-06 and LTM-08 | Closed: checkout, license safety, focus, dialog feedback, mixed import reporting, cache headers, and skip destination pass. |
| LTM-07 | **Reopened as F-7-1:** the originally measured links were repaired, but the full touch-target requirement still fails on three current controls. |
| F-2-1 through F-2-6 | Closed: complete claim outcomes, public claim coverage, route focus, comparison playback, action names, and format guidance pass. |
| F-3-1 through F-3-5 | Closed: visible sample proof, backup restore, grammar, stateful control labels, and stable route focus pass. |
| F-5-1 | Closed: `data-removal` is registered and passed. |
| F-5-2 | Closed: the 404 uses direct recovery words. |
| F-6-1 | Closed: the offline page uses direct recovery words and its action works. |

## Acceptance decision

**FAIL. Finding count: 1. Untested claim count: 0.**

The product's core job and every public claim pass, but the strict contract does
not permit PASS while F-7-1 remains.
