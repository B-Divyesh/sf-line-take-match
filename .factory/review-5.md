# Voice take comparison review 5 — Line Take Match

**Verdict: FAIL.** Two findings remain: one major and one minor. One public
claim is untested. A successful test run does not make the product a PASS.

Reviewed on 2026-09-06 UTC at <https://line-take-match.sociobot.in>.
The implementation candidate is
`ea8432eedf027124bb5d63d2c1d557859973f808`. The documentation baseline is
`1fcf957d6663ddb50c0c77ddd476af92d5aa7e74`. The commits between them change
only `.factory` reports and evidence. A clean build matched all 29 public live
artifacts byte for byte.

## First screen

Fresh Chromium contexts were used at 1440 × 960 and phone size. Before
scrolling, the page gives these answers:

| Question | Answer | Visible text |
| --- | --- | --- |
| What is the job? | Compare recorded voice takes with an approved take. | “Compare voice takes with an approved take.” |
| Who is it for? | Indie animators and game creators checking character lines. | “For indie animators and game creators checking whether recorded character lines match.” |
| What should I do first? | Open the sample. | “Try it with sample data” and “The demo opens three dialogue takes to compare.” |

The action, explanation, privacy fact, offline fact, and price are visible in
the phone first screen. The dark booth art and cyan, pink, and amber controls
match `.factory/design.md` and remain specific to this recording task.

## Findings

### F-5-1 / F-2-2 reopened — MAJOR — A privacy-control claim has no registered claim test

The Privacy page says: **“You can remove takes, site data, or your local
license.”** This is a public product promise. No entry in
`.factory/claims.json` states that removal promise. No `@claim:*` test removes
a take, clears site data, or removes a license and checks the resulting locked
and empty states.

The controls exist in the implementation, so this review does not classify
the sentence as false. It is untested under the required claims contract.
Earlier F-2-2 is reopened because the prior review missed this sentence while
declaring every public claim registered.

Fix by adding one `data-removal` claim and one tagged sandbox test. The test
should remove a take, prove final deletion after the undo window, remove a
license and prove Studio locks, then clear site data and prove an empty reload.
Alternatively, remove the public promise.

### F-5-2 — MINOR — The 404 page uses metaphor instead of plain recovery text

An unknown address correctly returns HTTP 404 and renders a usable page. The
status is expected and is not the defect. The copy is the defect:

- Eyebrow: “404 / Missing line”
- Heading: “This page missed its cue.”
- Body: “The address does not match a page in this take list.”

These phrases turn a missing web page into recording terms. They violate the
plain-words rule against metaphor headings and make the recovery message less
direct. Use “Page not found” and “This address does not match a page,” while
keeping the existing Home link and HTTP 404 status.

## Demo and data isolation

The one-click action opens `/?demo=1`. The first phone and desktop screens
show `door-warning_take-01`, `door-warning_take-02`, a `+3.4 dB` difference,
and **Play approved, then this take**. The full output has three takes, one
approved take, one review flag, notes, waveforms, four measurements, and CSV
export.

The banner stays visible and says “Demo — sample data, nothing is saved to
your take list.” **Reset demo** restores the original three takes. **Start for
real** clears the demo rows. The live verifier placed a sentinel only in its
fresh browser context and proved that reset and exit did not change it. Demo
work used `demo:line-take-match`; normal work used `line-take-match`. No user
or external real data was read or changed.

## Declared claims

All 16 commands from `.factory/claims.json` were run individually after
`npm ci` in a fresh clone. Every command passed. The aggregate claim run also
passed 16/16.

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

The landing page and README promises map to those entries. The removal
sentence on Privacy does not, producing the one untested claim in F-5-1.

## Normal, invalid, boundary, and recovery paths

| Path | Result and evidence |
| --- | --- |
| Normal | Sample and generated WAV flows imported, grouped, measured, approved, played in order, flagged, edited, persisted, and exported. |
| Invalid | Missing consent blocks import. A corrupt WAV reports its filename. Invalid, revoked, expired, wrong-product, and unreachable license checks keep Studio locked. |
| Boundary | Twelve free takes import and retain CSV export. Take 13 is rejected. A recorded valid license permits 13 takes. |
| Recovery | Mixed valid and corrupt imports report separate counts. Demo reset works. Backup restores audio and details in a clean context. Offline reload retains takes. Browser Back restores route focus. |
| Update | A temporary server changed only the service-worker response. A second worker request displayed “Update ready. Reload to use it.” |

The product is a static PWA. Backend tenant isolation, restart persistence,
health endpoints, and HTTP 429 behavior do not apply.

## Accessibility, routes, privacy, and performance

- Root, demo, Privacy, Terms, and an unknown route have one h1, a main
  landmark, route titles, descriptions, canonical links, shared navigation,
  legal links, and no serious or critical axe findings.
- The unknown route returns the expected HTTP 404. Root, demo, Privacy, and
  Terms return 200. Every rendered link returned 200, except the expected
  checkout response, which returned 303 to the hosted payment flow.
- The skip link moves focus to `#main`. Internal navigation and Back focus the
  route heading. Take actions retain equivalent focus after updates.
- The native Studio dialog focuses its close button. Escape closes it and
  restores focus to **See Studio — $19**. The next focus ring is a visible
  3 px cyan outline.
- At phone size there is no horizontal overflow. Tested home and legal targets
  meet 44 × 44 CSS pixels. The responsive layout also covers 200% desktop zoom
  reflow dimensions.
- With reduced motion requested, the live page reports `scroll-behavior: auto`,
  a maximum transition or animation duration of `0.00001s`, and no overflow.
- Live claim traffic for analysis is same-origin GET traffic with no request
  body. The only optional external product request is license verification to
  the listed Sociobot route. No analytics, remote fonts, transcription, or
  generation requests were found.
- `verify-url.sh` reported title, `lang="en"`, one h1, main, image alt text,
  named buttons, and zero console errors.
- Fresh live Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100, FCP 1.0 s, LCP 1.2 s, TBT 70 ms, CLS 0, total 33 KiB.
- The build emits 11.53 KiB gzip initial app JavaScript and 5.25 KiB gzip app
  CSS. It has no font payload. All stated static budgets pass.
- Root HTML and `sw.js` use `no-cache`. Hashed JavaScript uses one-year
  immutable caching. Security headers include CSP, HSTS, frame denial,
  `nosniff`, referrer policy, permissions policy, COOP, and CORP.

## Earlier finding disposition

Every earlier review, verification, polish report, and handoff was inspected.
These are fresh confirmations, not copied status labels.

| Earlier finding | Current disposition |
| --- | --- |
| F-1-1 | Fixed. The phone first screen states the job, audience, sample action, result, privacy, offline use, and price. |
| F-1-2 / F-3-1 | Fixed. The isolated sample is populated in the first view; reset, exit cleanup, sentinel isolation, and offline reload pass. |
| F-1-3 / LTM-01 | Fixed. Production checkout returns 303 to the hosted flow. |
| F-1-4 / F-2-1 | Fixed for all registered claims. All 16 exact commands pass. F-5-1 is a separate missed claim. |
| F-1-5 | Fixed. Real routes, metadata, sitemap, links, and expected 404 status pass. F-5-2 concerns only the 404 wording. |
| F-1-6 / LTM-08 | Fixed. Skip links transfer focus to main content. |
| F-1-7 | Fixed on the landing page. Its task headings and take/line terms remain literal and consistent. |
| F-1-8 | Fixed. Landing and README copy remain within the recorded limits. |
| LTM-02 | Fixed. Never-verified tokens remain locked when verification fails; cached validity is token-bound. |
| LTM-03 | Fixed. Approved, flag, and line actions keep equivalent keyboard focus. |
| LTM-04 | Fixed. Invalid-license feedback stays visible and announced inside the dialog. |
| LTM-05 | Fixed. Mixed imports report one success and one failure accurately. |
| LTM-06 | Fixed. Hashed assets are immutable; HTML and the worker revalidate. |
| LTM-07 | Fixed. Tested phone controls meet 44 px and no mobile overflow appears. |
| Manifest MIME observation | Fixed. Live manifest type is `application/manifest+json`. |
| F-2-2 / F-3-2 | Reopened in part as F-5-1. Earlier install, billing, privacy, and backup claims pass, but the removal promise is unregistered. |
| F-2-3 | Fixed. Route changes and Back focus and announce the destination. |
| F-2-4 | Fixed. One action plays the approved take before the candidate. |
| F-2-5 / F-3-4 | Fixed. Controls name their result, and “Approved take” is a status. |
| F-2-6 | Fixed. WAV recovery is direct and editable groups are called lines. |
| F-3-3 | Fixed. The summary says “1 line.” |
| F-3-5 | Fixed. The live focus verifier uses polling and passed this run. |

## Verification record

Fresh clone: `/tmp/line-take-match-review5.yPfpvD/repo` at documentation SHA
`1fcf957d6663ddb50c0c77ddd476af92d5aa7e74`.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS; 60 packages, 0 vulnerabilities |
| `npm test` | PASS; 13/13 |
| `npm run build` | PASS; `dist/` produced |
| Every exact claim command | PASS; 16/16 |
| `npm run test:claims` | PASS; 16/16 |
| `npm run test:e2e -- --workers=1` | PASS; 60/60 desktop and phone tests |
| `npm run verify:live` | PASS; zero console errors, demo/offline/routes/checkout/axe checks passed |
| `/opt/fleet/lib/verify-url.sh` | PASS |
| Live artifact comparison | PASS; 29/29 matched, 0 mismatches |
| Fresh live Lighthouse | PASS; 100/100/100/100 |

Screenshots and machine evidence are under `/work/.evidence/review-5/`.

## Acceptance decision

**FAIL.** Finding count: **2**. Untested claim count: **1**. The working
product paths are healthy, but the contract allows PASS only with zero
findings and zero untested claims.
