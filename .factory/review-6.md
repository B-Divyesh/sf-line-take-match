# Review 6 — compare recorded voice takes

## Verdict: FAIL

**Finding count: 1. Untested claim count: 0.**

Reviewed on 2026-09-06 UTC at <https://line-take-match.sociobot.in>.
The implementation candidate is
`3c02de9b2659623f80a97e27f643a85cf337b62a`. The documentation baseline is
`3dad31571b8ac38f2e28093598fb11de13154df9`. The intervening commits are
reports and evidence only; the deployed product matches the implementation
candidate's 29 public artifacts byte-for-byte.

## Job, audience, and first action

Fresh 1440 x 960 desktop and 390 x 844 phone browser contexts, before
scrolling, showed the following:

| Question | Answer shown |
| --- | --- |
| Job | Compare recorded voice takes with an approved take. |
| Audience | Indie animators and game creators checking recorded character lines. |
| First action | **Try it with sample data**; it opens three dialogue takes to compare. |

Both contexts had the correct title, one h1, no console errors, and the first
action inside the viewport. The product's dark recording-booth visual system
matches the documented single dark treatment.

## Finding

### F-6-1 — MINOR — The offline fallback uses metaphor copy

The shipped and live offline fallback at `/offline.html` has the heading
**“The stall is offline.”** and the recovery link **“Try the takeboard
again.”** This is a real product recovery page, but both phrases use
night-market lore instead of direct language. It violates the plain-words
contract: headings and recovery actions must say what happened and what to do
next without metaphor.

The page otherwise loads without console errors and has one h1 and one main
landmark on fresh phone and desktop contexts. Replace the heading with
**“You’re offline”** and the action with **“Try again”** or **“Open Line Take
Match”**. Keep the useful sentence explaining that one connected visit caches
the app.

## Demo, normal paths, and recovery

The one-click sample opens in `?demo=1` with three realistic door-warning
takes, an approved take, comparison action, measurement difference, a
persistent **Demo — sample data, nothing is saved** label, **Reset demo**, and
**Start for real**. The sample comparison is visible in the first phone and
desktop demo viewport.

On the fresh desktop context, editing a sample note then resetting restored
the original note. Leaving the demo opened an empty real list. The live
verifier also placed a real-database sentinel and proved reset and exit did
not alter it, while demo rows were cleared. It proved the demo reloads offline
after the first visit.

The clean browser suite exercised normal imports, comparison, flagging,
persistence, CSV export, invalid consent, corrupt-file recovery, the 12-take
free limit, 13 licensed takes, invalid/revoked/expired/wrong-product licenses,
backup restoration in another browser context, keyboard focus, dialog errors,
and update notice behavior. The static PWA has no backend, so tenant
isolation, restart persistence, health endpoints, and 429/Retry-After checks
do not apply.

## Claims

All 17 exact commands declared in `.factory/claims.json` were run independently
after `npm ci` from a clean detached checkout. Each passed. The aggregate
claim suite also passed 17/17, and every registered id has exactly one
`@claim:` test.

| Claim ids | Result |
| --- | --- |
| `demo-sandbox`, `local-private`, `no-voice-services`, `offline-reload` | PASS |
| `filename-grouping`, `comparison-cues`, `csv-export`, `free-limit` | PASS |
| `studio-backup`, `billing-api`, `no-tracking`, `pwa-install` | PASS |
| `payment-isolation`, `license-storage`, `license-states` | PASS |
| `comparison-playback`, `data-removal` | PASS |

The landing page, README, Privacy, and Terms were checked against the claim
registry. The privacy removal sentence found in review 5 is now covered by
`data-removal`; no public product promise was left untested. The offline-copy
finding is a language defect, not an untested claim.

## Accessibility, routes, privacy, and PWA

- `npm run verify:live` passed: zero console errors; demo isolation, reset,
  exit cleanup, offline reload, invalid-license rejection, manifest MIME type,
  checkout redirect, five route checks, and zero serious or critical axe
  violations.
- Fresh live Axe scans covered root, demo, Privacy, Terms, and an unknown
  route. Each has one h1, a main landmark, and no serious or critical issue.
  `verify-url.sh` also passed on the root with title, `lang=en`, image alt
  text, named buttons, and no console errors.
- The expected unknown-path response is HTTP 404 with **Page not found** and a
  recovery link. It is correct and is not a defect. Root, demo, Privacy, and
  Terms return 200 with route-specific titles and canonical URLs.
- Keyboard checks passed for the skip link, internal navigation and Back,
  stateful take controls, dialog feedback, and visible focus. Phone layout had
  no horizontal overflow; tested navigation targets meet 44 x 44 CSS pixels.
- With reduced motion requested, the live demo reported `scroll-behavior: auto`,
  a maximum transition/animation duration of `0.00001s`, and no overflow.
- Analysis and sample flows made same-origin GET requests with no request body.
  The only optional external product request is the documented Sociobot
  license route. No analytics, remote fonts, transcription, or generation
  requests were found.
- All rendered internal links returned 200. The Studio checkout link returned
  its expected 303 hosted-checkout redirect; the external contact link returned
  200.
- The manifest, service worker, local storage, exported data, and offline
  reload behavior match the PWA/local-first contract. Root HTML and the worker
  revalidate; hashed assets use one-year immutable caching.

## Clean commands and live artifact

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 60 packages, 0 vulnerabilities |
| `npm test` | PASS; 13/13 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; `dist/` produced |
| Every declared claim command | PASS; 17/17 |
| `npm run test:claims` | PASS; 17/17 |
| `npm run test:e2e -- --workers=1` | PASS; 62/62 (`test-results/.last-run.json` reports `passed`) |
| `npm run verify:live` | PASS |
| `/opt/fleet/lib/verify-url.sh` | PASS |
| Public artifact comparison | PASS; 29/29 byte-for-byte, 0 mismatches |
| Fresh mobile Lighthouse | PASS; Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 40 ms, CLS 0 |

The production build emits 11.53 KiB gzip application JavaScript and 5.25 KiB
gzip application CSS, within the static budgets.

## Earlier findings

All earlier finding groups were inspected rather than assumed closed.

| Earlier finding group | Current disposition |
| --- | --- |
| F-1-1 through F-1-8 | Fixed and rechecked: clear first screen, isolated demo, checkout, claims, routes/404, skip focus, terminology, and concise copy. |
| LTM-01 through LTM-08 | Fixed and rechecked: checkout, license safety, mutation/dialog focus, mixed import reporting, cache policy, touch targets, and skip destination. |
| F-2-1 through F-2-6 | Fixed and rechecked: complete claims, registrable promises, route focus, comparison playback, result-naming controls, and format guidance. |
| F-3-1 through F-3-5 | Fixed and rechecked: populated sample viewport, portable backup test, singular count, controls, and stable route-focus verification. |
| F-5-1 | Fixed: `data-removal` is registered and its full outcome test passed. |
| F-5-2 | Fixed: the designed HTTP 404 now says **Page not found** with direct recovery copy. |

## Acceptance decision

**FAIL.** Finding count: **1**. Untested claim count: **0**.

The core job, claims, local-first demo, PWA behavior, accessibility, routes,
and live artifact pass. The product cannot receive PASS until F-6-1 replaces
the metaphor copy on its offline recovery page with plain language.

Evidence is stored in `/work/.evidence/review-6-live/`,
`/work/.evidence/review-6-root/`, and
`/work/.evidence/review-6-lighthouse.json`.
