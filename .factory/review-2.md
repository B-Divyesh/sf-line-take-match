# Adversarial first-read review 2 — Line Take Match

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against commit `fd313285bcd56174a9dece787869473578315fd3` and the live site at <https://line-take-match.sociobot.in>. Product code was not changed.

The live product is clear and genuinely tryable. The demo, checkout, routes, accessibility scan, and automated suites all work. Acceptance still fails because the claim registry does not prove several complete promises, additional public claims remain unlisted, route changes do not meet the supplied focus rule, and the core listening workflow lacks a direct approved-versus-candidate playback action.

## 30-second cold read

Fresh Chromium contexts were opened at 390×844 and 1280×800 with no existing site data.

- **What does it do?** It compares recorded dialogue takes with an approved take and shows level, pace, pause, and pitch-range differences.
- **For whom?** Indie animators and game creators checking character-line consistency.
- **What should I click first?** **“Try it with sample data.”** The adjacent sentence says that it opens three dialogue takes.

All three answers are available before scrolling at both widths. On mobile, the demo action ends at y=681, the explanation ends at y=711, and the privacy, offline, and price facts end at y=815. No cold-read blocker is present. The exact first-screen copy is “Compare voice takes with an approved take.” and “For indie animators and game creators checking whether recorded character lines match.”

## Findings

### F-2-1 — BLOCKING — The claim work is only partially fixed (reopens F-1-4)

All ten commands in `.factory/claims.json` pass individually, but several tests do not assert the full sentence registered to them. This leaves published behavior untested despite green selectors.

| Registered claim | What the tagged test actually proves | Missing assertion |
| --- | --- | --- |
| “Audio analysis and take data stay in the browser; recordings are not uploaded.” | Captures URLs after the demo has loaded and checks that every URL is same-origin. | It does not assert request methods or bodies. A same-origin audio `POST` would pass. Capture the whole flow and assert no request carries audio or other take data. |
| “Numbered take filenames group by dialogue line and each line remains editable.” | Finds two line inputs after grouping. | It never edits a line, saves it, reloads, or verifies the changed group. A read-only input would pass. |
| “The app compares level, pace, pauses, and pitch range against an approved take as review cues.” | Counts four `.metric` elements, checks only “Level” and “Pitch range,” then finds one generic difference. | Assert all four named measurements and an observable delta for each non-reference sample. |
| “CSV export includes one row per take with review details and measurements.” | Checks four rows, the header prefix through `flagged_for_review`, and one flagged row. | It does not assert the note or any measurement column/value. |
| “A $19 one-time Studio license adds unlimited takes and backups that include audio.” | Reads the app’s own $19 link, injects a valid verdict, imports 13 files, and checks backup audio. | The quantitative $19 provider price is not measured. The live catalog currently reports USD 1900, but the tagged sandbox test would still pass if billing changed. |

**Why this blocks acceptance:** The supplied claims contract requires an observable test for the whole promise, including quantitative values. These tests can stay green when material parts of their claims are false.

**Concrete fix:** Strengthen the existing `@claim:` tests with the assertions above. For price, use a recorded catalog response in the sandbox and keep a separate live catalog check. Make the claim command fail when any promised field, value, edit, or privacy boundary changes.

### F-2-2 — MAJOR — Public claim-like sentences remain outside `.factory/claims.json`

The following live or README statements have no registry entry that covers the whole promise:

| Location | Exact quote | Concrete fix |
| --- | --- | --- |
| README | “After one online visit, you can install the app and use it offline.” | Add an installability claim and manifest/service-worker test, or remove “install the app.” `offline-reload` covers only offline reload. |
| README and Privacy | “The app has no analytics, trackers, remote fonts, transcription calls, or generation calls.” / “The app sends no analytics, advertising, fingerprinting, transcription, or voice-generation requests.” | Add one privacy claim that checks every loaded script/font URL and all fetch/XHR/beacon traffic for the full demo flow. |
| Landing Studio dialog | “Sociobot/Dodo is the merchant of record.” | Add an evidence-backed billing claim or keep this only in legal copy backed by billing configuration evidence. A redirect to a Dodo hostname alone does not prove merchant-of-record status. |
| Landing Studio dialog | “Refunds are handled there and revoke the license.” | Add a tagged revoked-license browser flow and evidence for who handles refunds; otherwise rewrite to the tested behavior: “A revoked license no longer unlocks Studio.” |
| Privacy | “Payment details never reach this app.” | Add a tagged checkout/privacy test that proves the app never receives payment fields or remove the absolute. |
| Privacy | “Your license and its daily verification result stay in browser storage.” | Add a storage assertion to the billing claim. The local-private test exercises take data only. |
| Terms | “A refunded, revoked, invalid, expired, or wrong-product license stops Studio features.” | Add tagged cases for every listed state. Current unit coverage explicitly checks invalid and revoked, not every named state. |
| README | “This repository does not contain billing credentials.” | Add a scoped secret-scan claim test or rewrite as a non-absolute architecture statement. |
| Landing and README | “WAV is the safest choice.” | Remove this untestable comparative or replace it with the concrete recovery instruction in F-2-6. |

**Why this matters:** A visitor can rely on privacy, payment, and license statements as much as on export behavior. Passing the ten listed commands does not test these additional promises.

### F-2-3 — MAJOR — Route changes leave focus on `BODY` and provide no route announcement

**Evidence:** From `/`, activating the header **“Privacy”** link loads `/privacy/`, but `document.activeElement` is `BODY`, not the new h1. Browser Back returns to `/` with focus still on `BODY`. Source contains skip-link focus handling but no route-entry h1 focus or polite route announcement.

**Why this matters:** The supplied site-structure contract explicitly requires focus on the new h1 and a polite announcement on route change. A keyboard or screen-reader user gets no programmatic destination after navigating or returning.

**Concrete fix:** Give route h1 elements a programmatic focus target, move focus on internal route entry/back restoration, and announce the route title in an `aria-live="polite"` region. Add forward/back browser tests for root, demo, Privacy, Terms, and 404. Do not steal focus on a cold external arrival.

### F-2-4 — MAJOR — The core comparison lacks one-action approved-versus-candidate playback

**Location:** Populated take list in the demo and real app. Each take has an independent native audio player, but alternatives have no **“Play approved, then this take”** action.

**Why this is missed leverage:** The product says measurements are cues and tells the user to listen before deciding. On a phone, the approved take and later candidates are separated by long cards, so the core A/B task requires scrolling and manually coordinating two players.

**Concrete fix:** Add **“Play approved, then this take”** to every non-approved take. It should stop other playback, play the approved recording followed by the candidate, expose playing/paused state, work by keyboard, remain local/offline, and have a demo claim test that verifies playback order without uploading audio. This needs no AI; model use would add privacy and cost without helping the stated job.

### F-2-5 — MINOR — One header button does not name its result

**Location / quote:** Header button **“Studio — $19.”**

**Why this fails plain words:** It is a noun and price, not a result-naming verb. A first-time visitor cannot tell whether it buys immediately or opens details.

**Concrete fix:** Rename it **“See Studio — $19”** or **“View Studio details.”** Keep **“Buy Studio — $19 once”** inside the dialog for the purchase action.

### F-2-6 — MINOR — Format guidance is vague, and the line-group term drifts

**Locations / quotes:** Landing and README: **“WAV is the safest choice.”** The same grouping concept appears as **“line,” “line name,” “Line group,”** and **“Dialogue lines.”**

**Why this matters:** “Safest” does not say whether it means compatibility, data safety, or rights. The grouping labels make an editable line look like several concepts.

**Concrete fix:** Replace the format sentence with **“If another format fails, convert it to WAV and try again.”** Use **“line”** everywhere: “edit every line,” input label “Line,” and sidebar “Lines.”

## Demo and sandbox check

**PASS.** The first-screen action is one click from `/` and opens `/?demo=1`. At 390×844 it immediately shows the persistent banner, a populated summary of 1 line / 3 takes / 1 flagged take, the “door warning” line, and the start of the approved take card. The sample contains three distinct named recordings, notes, measured differences, one approved take, and one flagged take.

The banner reads **“Demo — sample data, nothing is saved to your take list”** and includes **“Reset demo”** and **“Start for real.”** A sentinel inserted into `line-take-match` survived demo editing and reset. Demo work used `demo:line-take-match`; Reset restored the original note; Start for real cleared demo rows and exposed only the real sentinel. Going Back re-entered a freshly seeded three-take demo. Offline reload retained all three samples. No real data was changed by product demo actions.

## Claim command results

Clean clone: `/tmp/ltm-review2.541MpO`, commit `fd313285bcd56174a9dece787869473578315fd3`.

| Claim id | Exact command from registry | Result |
| --- | --- | ---: |
| `demo-sandbox` | `npm run test:claims -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `local-private` | `npm run test:claims -- --grep @claim:local-private` | PASS, 1 test |
| `no-voice-services` | `npm run test:claims -- --grep @claim:no-voice-services` | PASS, 1 test |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS, 1 test |
| `filename-grouping` | `npm run test:claims -- --grep @claim:filename-grouping` | PASS, 1 test |
| `comparison-cues` | `npm run test:claims -- --grep @claim:comparison-cues` | PASS, 1 test |
| `csv-export` | `npm run test:claims -- --grep @claim:csv-export` | PASS, 1 test |
| `free-limit` | `npm run test:claims -- --grep @claim:free-limit` | PASS, 1 test |
| `studio-backup` | `npm run test:claims -- --grep @claim:studio-backup` | PASS, 1 test |
| `billing-api` | `npm run test:claims -- --grep @claim:billing-api` | PASS, 1 test |

`local-private` and `no-voice-services` deliberately select the same test because its title carries both tags. This is one tagged test for each id, not an absent selector. The assertion gaps are recorded in F-2-1.

## Claim-copy cross-check

| Public claim or claim group | Registry coverage | Review result |
| --- | --- | --- |
| Demo opens three samples, uses separate storage, resets, and leaves the real list unchanged | `demo-sandbox` | Listed; observable isolation passes. |
| Audio/take data stay in the browser; recordings are not uploaded | `local-private` | Listed; test is incomplete (F-2-1). |
| No transcription, generation, or cloning | `no-voice-services` | Listed; demo request capture and boundary copy pass. |
| Works offline after first visit | `offline-reload` | Listed; offline controlled reload passes. |
| Numbered filenames group by line and line is editable | `filename-grouping` | Listed; edit behavior is not exercised (F-2-1). |
| Level, pace, pauses, and pitch range compare with approved take | `comparison-cues` | Listed; not every named outcome is asserted (F-2-1). |
| CSV has one row per take, review details, and measurements | `csv-export` | Listed; note/measurement output is not asserted (F-2-1). |
| Free mode has 12 takes and CSV | `free-limit` | Listed; limit and export availability pass. |
| $19 once; unlimited takes; backups include audio | `studio-backup` | Listed; capability passes, provider price is not asserted by the tagged test (F-2-1). |
| Checkout and verification use Sociobot product routes | `billing-api` | Listed; exact client routes and invalid result pass. |
| Installability; analytics/tracker/font absence; merchant/refund behavior; payment-field isolation; license storage/states; credential absence; “safest” format | None | Unlisted (F-2-2/F-2-6). |

## Copy audit

Counts use whitespace-delimited words; punctuation-only separators do not count. Hyphenated terms, filenames, versions, and prices count as one word. No sentence exceeds 22 words and no banned marketing word appears. “Flag” points to a finding above.

### Landing page and closed Studio dialog

| Location | Exact copy | Words | Audit |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | Pass |
| Wordmark | Line Take Match | 3 | Pass |
| Navigation | Demo | 1 | Pass; destination link |
| Navigation | Privacy | 1 | Pass; destination link |
| Header button | Studio — $19 | 2 | F-2-5: not a result-naming verb |
| Eyebrow | Voice take comparison | 3 | Pass |
| h1 | Compare voice takes with an approved take. | 7 | Pass |
| Hero | For indie animators and game creators checking whether recorded character lines match. | 12 | Pass |
| Primary action | Try it with sample data | 5 | Pass |
| Secondary action | Import audio takes | 3 | Pass |
| Action explanation | The demo opens three dialogue takes to compare. | 8 | Listed claim |
| Fact | Audio stays on this device | 5 | Listed claim; test gap F-2-1 |
| Fact | Works offline after the first visit | 6 | Listed claim |
| Fact | Free for 12 takes · Studio costs $19 once | 8 | Listed claim; price gap F-2-1 |
| Hero alt | An empty voice booth glowing behind a rain-soaked night-market window, with a microphone and waveform-shaped paper strips | 17 | Pass |
| Kicker | 01 / Import | 2 | Pass |
| h2 | Import audio takes | 3 | Pass |
| Import help | Choose audio files your browser can play. | 7 | Pass |
| Import help | WAV is the safest choice. | 5 | F-2-6: vague comparative |
| Import help | Filenames such as door-warning_take-03.wav group by line. | 7 | Listed claim |
| Consent | I have the performer’s consent and rights to review these recordings. | 11 | Pass; user attestation |
| File action | Import audio takes | 3 | Pass |
| Free counter | 12 of 12 free takes remain | 6 | Listed claim |
| Kicker | 02 / Compare | 2 | Pass |
| h2 | Your takes will appear here | 5 | Pass |
| Empty state | Import two or more recordings of one line. | 8 | Pass |
| Empty state | Choose the approved take, then listen to any measured differences. | 10 | Pass |
| Empty-state step | Group takes by filename | 4 | Listed claim |
| Empty-state step | Choose the take to compare against | 6 | Pass |
| Empty-state step | Flag a take and export CSV | 6 | Listed claim |
| Kicker | 03 / Workflow | 2 | Pass |
| h2 | Compare recorded takes | 3 | Pass |
| Step | Import audio. | 2 | Pass |
| Step | Filenames group takes for the same line. | 7 | Listed claim |
| Step | Choose the approved take. | 4 | Pass |
| Step | Compare level, pace, pauses, and pitch range. | 7 | Listed claim; test gap F-2-1 |
| Step | Flag and export. | 3 | Pass |
| Step | Add notes and download a CSV for your team. | 9 | Listed claim; test gap F-2-1 |
| Kicker | 04 / Boundaries | 2 | Pass |
| h2 | Keep the performance human | 4 | Pass in boundary context |
| Boundary | Line Take Match does not transcribe, generate, or clone voices. | 10 | Listed claim |
| Boundary | Measurements are review cues, never performance scores. | 7 | Listed claim |
| Kicker | 05 / Studio | 2 | Pass |
| h2 | Keep larger take lists together | 5 | Pass |
| Tier | Free mode includes 12 takes and CSV exports. | 8 | Listed claim |
| Tier | Studio costs $19 once and adds unlimited takes and audio backups. | 11 | Listed claim; price gap F-2-1 |
| Tier action | See Studio details | 3 | Pass |
| Dialog action | Close Studio details | 3 | Pass; accessible name for icon button |
| Dialog eyebrow | Studio license | 2 | Pass |
| Dialog h2 | Keep all your takes together | 5 | Pass |
| Dialog | Free mode compares up to 12 takes and includes CSV export. | 11 | Listed claim |
| Dialog | Studio costs $19 once. | 4 | Listed claim; price gap F-2-1 |
| Dialog | It adds unlimited takes and portable project backups. | 8 | Listed claim |
| Dialog item | Unlimited takes and lines on this device | 7 | Listed claim |
| Dialog item | Download a backup with your audio | 6 | Listed claim |
| Dialog item | Core comparison and CSV stay free | 6 | Listed claim |
| Purchase action | Buy Studio — $19 once | 4 | Pass |
| License label | Have a license? Paste it here | 6 | Pass |
| Restore action | Verify and restore | 3 | Pass |
| Restore help | Paste your Studio license token, then verify and restore it. | 10 | Pass |
| Dialog legal | Sociobot/Dodo is the merchant of record. | 6 | F-2-2: unlisted claim |
| Dialog legal | Refunds are handled there and revoke the license. | 8 | F-2-2: unlisted claim |
| Dialog legal | See privacy and terms. | 4 | Pass |
| Footer | Compare recorded voice takes without uploading audio. | 7 | Listed claim; test gap F-2-1 |
| Footer links | Privacy / Terms | 1 / 1 | Pass |
| Footer provenance | Built by Param Factory | 4 | Pass |
| Footer build | v1.1.0 · polish-1 | 2 | Pass |

### README

| Location | Exact copy | Words | Audit |
| --- | --- | ---: | --- |
| h1 | Compare voice takes with an approved take | 7 | Pass |
| Intro | Line Take Match helps indie animators and game creators compare recorded dialogue with an approved take. | 16 | Listed claim |
| Intro | It measures level, pace, pauses, and pitch range as review cues. | 11 | Listed claim; test gap F-2-1 |
| Intro | It does not transcribe, generate, clone, or upload voices. | 9 | Listed claims |
| Intro | Audio and take data stay in your browser. | 8 | Listed claim; test gap F-2-1 |
| Intro | After one online visit, you can install the app and use it offline. | 13 | F-2-2: installability is unlisted |
| Tier | Free mode supports 12 takes and CSV export. | 8 | Listed claim |
| Tier | Studio costs $19 once. | 4 | Listed claim; price gap F-2-1 |
| Tier | It adds unlimited takes and backups that include audio. | 9 | Listed claim |
| Link label | Live app | 2 | Pass |
| Link label | One-click demo | 2 | Pass |
| Demo | The demo opens three sample dialogue takes. | 7 | Listed claim |
| Demo | It uses separate browser storage and clears that storage when you start for real. | 14 | Listed claim |
| h2 | Run locally | 2 | Pass |
| Run | Open the shown local URL. | 5 | Pass |
| Run | Confirm performer consent, then import audio your browser can play. | 10 | Pass |
| Run | WAV is the safest choice. | 5 | F-2-6: vague comparative |
| Run | Numbered filenames such as `_take-03` or `_v2` group by line. | 10 | Listed claim |
| Run | You can edit every line name. | 6 | Listed claim; test gap F-2-1 and term drift F-2-6 |
| h2 | Test and build | 3 | Pass |
| Build | The production command checks types and builds every page. | 9 | Verified by clean build |
| Build | It then adds the current files to the offline cache. | 10 | Verified by build output/source |
| Build | Deploy the generated `dist/` directory. | 5 | Pass |
| Tests | The browser suite uses Playwright 1.58.2. | 6 | Verified by package lock |
| Tests | It covers desktop, 390px mobile, browser storage, accessibility, privacy, and offline reload. | 12 | Verified by test source/run, subject to F-2-1 |
| Tests | The live verifier checks the deployed demo, routes, 404, checkout, manifest, isolation, offline reload, focus, mobile layout, and accessibility. | 19 | Verified by script/run |
| h2 | Data and privacy | 3 | Pass |
| Privacy item | Recordings, measurements, flags, line names, notes, and licenses stay in browser storage. | 12 | Partly listed; license storage is unlisted in F-2-2 |
| Privacy item | The demo uses the separate `demo:line-take-match` database. | 7 | Listed claim |
| Privacy item | CSV exports stay free. | 4 | Listed claim |
| Privacy item | Studio backups contain the audio itself. | 6 | Listed claim |
| Privacy item | Treat them like source recordings. | 5 | Pass; safety instruction |
| Privacy item | License verification is the only optional request to Sociobot. | 9 | Listed by `billing-api` |
| Privacy item | The app has no analytics, trackers, remote fonts, transcription calls, or generation calls. | 13 | F-2-2: partly unlisted |
| Docs | Read the privacy policy, terms, research brief, and visual system. | 10 | Pass |
| h2 | Deployment | 1 | Pass |
| Deployment | Deploy `dist/` to an HTTPS static host that serves directory index files. | 12 | Pass |
| Deployment | Unknown paths must use `404/index.html` with status 404. | 8 | Verified live and in config |
| Deployment | The factory owns infrastructure, DNS, and paid-product registration. | 8 | Repository boundary |
| Deployment | This repository does not contain billing credentials. | 7 | F-2-2: unlisted absolute |
| License | Licensed under the MIT License. | 5 | Verified by `LICENSE` |

## History audit

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, `.factory/verification*.md`, and the prior handoff was read. Each earlier defect was checked live and in source, not accepted from its closure note.

| Earlier id | Round-2 status | Fresh evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Both cold viewports state job, audience, demo action, explanation, and three facts above the fold. |
| F-1-2 | Fixed | Three samples, banner, `demo:` database, reset, exit cleanup, real sentinel preservation, and offline reload pass. |
| F-1-3 / LTM-01 | Fixed | Checkout returns HTTP 303 to `checkout.dodopayments.com`; public catalog reports USD 1900. |
| F-1-4 | **Partially fixed; reopened as F-2-1** | Registry and selectors exist, but tagged assertions do not prove complete promises. |
| F-1-5 | Fixed | Real route documents, complete metadata, sitemap, and designed unknown-path HTTP 404 pass. |
| F-1-6 / LTM-08 | Fixed | Skip-link activation focuses `#main` on app and legal pages. This is separate from route-entry focus in F-2-3. |
| F-1-7 | Fixed | Metaphor headings were replaced; core terms are substantially clearer. Residual line-term drift is F-2-6. |
| F-1-8 | Fixed | README maximum is 19 words in this audit; no sentence exceeds 22 words. |
| LTM-02 | Fixed | New/unverified tokens remain locked offline; cached validity is token-bound. Four license unit tests pass. |
| LTM-03 | Fixed | Reference, flag, and line mutations restore focus to equivalent controls in browser tests. |
| LTM-04 | Fixed | Invalid license feedback remains in the open dialog with the entered token. |
| LTM-05 | Fixed | Mixed import reports one success and one failure. |
| LTM-06 | Fixed | Hashed assets are immutable; HTML/service worker remain update-friendly in config/tests. |
| LTM-07 | Fixed | Home/legal targets pass 44px tests; no 390px overflow was found. |
| Verification-3 manifest observation | Fixed | Live manifest returns `application/manifest+json`. |

## Structure, routing, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | PASS: root is “Line Take Match — compare recorded voice takes”; Demo, Privacy, Terms, and 404 use route-specific patterns, all under 60 characters. |
| Semantics | PASS: `lang=en`, one h1, one main, ordered h1→h2→h3 outline where used. |
| Metadata | PASS: every route has description, canonical, OG/Twitter data, SVG favicon, 180px Apple icon, and product-art 1200×630 social image. |
| Deep links / 404 | PASS: `/demo/`, `/privacy/`, and `/terms/` open directly. Unknown paths return the designed page with HTTP 404. Direct `/404/` is the designed document. |
| Back button | PASS for state: Privacy→Back restores root; Start for real→Back reseeds the isolated demo. Focus fails F-2-3. |
| Link crawl | PASS: every internal link returned 200; checkout returned 303; `https://sociobot.in/` returned 200. No dead link was found. |
| Header/footer | PASS: wordmark, Demo, Privacy, legal links, product line, Param Factory credit, and build id are present as applicable. |
| Sitemap/robots | PASS: sitemap lists root, Demo, Privacy, and Terms; robots points to it. |
| Security delivery | PASS: live CSP, HSTS, `nosniff`, referrer policy, frame denial, permissions policy, COOP, and CORP are present. |
| Accessibility scan | PASS: axe reported zero violations at mobile and desktop on root, demo, Privacy, Terms, and a real unknown-path 404. No console errors or mobile overflow occurred. |
| Visual identity | PASS: the near-black booth, paper labels, cyan/magenta/amber measurement language, clipped panels, and original night-market booth art are distinct from a generic SaaS template and match `.factory/design.md`. Asset provenance is recorded. |

The root h1’s raw `textContent` is `Compare voice takeswith an approved take.` because `<br>` has no source whitespace. Chromium’s accessibility name correctly normalizes it to “Compare voice takes with an approved take.”, so this is not raised as a finding.

## Quality-gate evidence

From the clean clone:

- `npm ci`: passed; 0 vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed and produced `dist/` with all five page documents.
- Every claim command: passed individually as listed above.
- `npm run test:e2e`: 40/40 passed across desktop and 390px mobile.
- App JavaScript: 28.89 KB raw / 10.85 KB gzip, within the static-product budget.

Live checks:

- No initial-load console errors at either cold viewport.
- `npm run verify:live` passed demo isolation/reset/exit/offline, checkout, invalid-license rejection, manifest MIME, route status/title, and serious axe checks.
- Independent axe scans found zero violations of any impact on five routes at both viewports.
- Checkout returned 303 to hosted Dodo checkout; invalid verification remained rejected.

## What would make this perfect

Close F-2-1 by making each tagged test prove every word of its claim, then register or remove every claim in F-2-2. Add route-entry/back focus and announcement behavior, add one-action approved-then-candidate playback for the core listening loop, and finish the two small copy fixes. Re-run the same clean-clone commands, live demo isolation/offline interception, full claim-copy cross-check, link crawl, mobile/desktop axe scan, and history audit. PASS requires zero remaining findings and no untested claim.
