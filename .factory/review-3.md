# Adversarial first-read review 3 — Line Take Match

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against commit `830fd8e60c29e07f377537083d921968202b085b` and the live site at <https://line-take-match.sociobot.in>. Product code was not changed.

The landing page passes the cold read and the sandbox is isolated. Acceptance still fails because the first demo viewport does not show an actual sample take or comparison result. One public backup claim is also outside the claim registry, several stateful buttons do not name their result, the demo has a visible plural error, and the advertised live verifier is nondeterministic.

## 30-second cold read

Fresh Chromium contexts were opened at 390×844 and 1280×800 with no site data. Nothing was scrolled before recording these answers.

- **What does it do?** It compares recorded voice takes with an approved take.
- **For whom?** Indie animators and game creators checking recorded character lines.
- **What should I click first?** **“Try it with sample data.”** The adjacent sentence says it opens three dialogue takes.

The exact first-screen copy is **“Compare voice takes with an approved take.”** and **“For indie animators and game creators checking whether recorded character lines match.”** Both actions and all three facts fit in the 390×844 viewport. The mobile demo action ends at y=681; the last fact ends before y=844. The desktop result is equally clear. No landing cold-read blocker remains.

## Findings

### F-3-1 / F-1-2 (reopened) — BLOCKING — The first demo viewport hides the sample and the comparison

**Location / quote:** live `/?demo=1`, immediately after pressing **“Try it with sample data.”** The viewport shows **“Compare these sample voice takes”** and the summary **“1 lines / 3 takes / 1 flagged,”** but no take name, audio control, waveform, measured difference, note, or comparison action.

**Evidence:** At 390×844, the board tools extend to y=954, the sample line starts at y=982, and the first take card starts at y=1262. At 1280×800, the first take card starts at y=935. The page remained at `scrollY=0`. The data is present in the DOM, but the first screen after the one-click entry does not show the product being used with realistic sample data.

**Why this blocks acceptance:** The supplied demo contract requires the first post-click screen to show the value with realistic sample data. Counts alone do not demonstrate an approved take, a candidate difference, or the listening workflow. A phone visitor still has to scroll more than one screen before seeing the first sample and farther again before seeing a comparison.

**Concrete fix:** Compress or remove the large demo intro and move a representative comparison above the tools. At 390×844, show the approved take name, one candidate name, at least one measured delta, and **“Play approved, then this take.”** Add a browser assertion that these elements’ bounding boxes end within the first viewport at both 390×844 and desktop sizes.

### F-3-2 / F-2-2 (reopened) — MAJOR — “Portable project backups” is an unlisted claim

**Location / quote:** Studio dialog: **“It adds unlimited takes and portable project backups.”** The export toast also says **“Portable project backup exported.”**

**Evidence:** `.factory/claims.json` registers a backup that “includes audio.” `@claim:studio-backup` downloads the file and inspects its JSON and audio data, but it never imports that file into another clean browser state. No tagged claim proves portability or restoration. A separate manual live smoke check did successfully re-import a demo backup, producing six cards and six playable audio elements, but that unregistered check will not protect the public promise from regression.

**Why this matters:** “Portable” promises that the downloaded project can be moved and restored, not merely that a file downloads. This is a claim a paying visitor can rely on.

**Concrete fix:** Register the full portability claim. In its tagged test, export from one clean context, import into another, accept the explicit add confirmation, and assert take count, line names, notes, measurements, flags, approved state, and playable audio. Otherwise remove “portable” from the dialog and toast.

### F-3-3 — MINOR — The demo summary says “1 lines”

**Location / quote:** first demo screen: **“1 LINES.”**

**Why this matters:** This grammar error is prominent in the exact screen intended to establish confidence in the sample.

**Concrete fix:** Render `1 line` and pluralize only for other counts. Add a demo assertion for the one-line sample.

### F-3-4 / F-2-5 (reopened) — MINOR — Three button states do not name the result of pressing them

**Location / quote:** populated take list and licensed header: **“✓ Approved,” “⚑ Flagged,”** and **“Studio active.”**

**Why this fails plain words:** “⚑ Flagged” removes the flag when pressed, while “Studio active” opens license details. Neither label states that result. “✓ Approved” remains interactive even though pressing it has no further effect. These are state labels presented as actions.

**Concrete fix:** Use **“Remove review flag”** for the pressed flag action and **“Manage Studio license”** for the header action. Render the current approved state as a non-action status, or disable it with the label **“Approved take.”**

### F-3-5 — MINOR — The documented live verifier races the route-focus behavior

**Location:** `scripts/verify-live.mjs:46-48`; README command `npm run verify:live`.

**Evidence:** Five clean-clone runs produced two passes and three failures with **“Privacy navigation did not move focus to its heading.”** The script checks `document.activeElement` immediately after Playwright’s click completes. Independent sampling showed `BODY` at 0 ms and the Privacy `H1`, plus **“Privacy — Line Take Match.”** in the polite live region, within 10–20 ms. The product behavior completes on its scheduled animation frame; the verifier sometimes checks before that frame.

**Why this matters:** The README presents this as the live release check. A nondeterministic verifier can reject an unchanged good deployment and makes the handoff evidence irreproducible.

**Concrete fix:** Replace the immediate boolean checks with Playwright polling assertions such as `await expect(page.locator('h1')).toBeFocused()` and `await expect(page.locator('#route-announcement')).toHaveText(...)`. Keep a bounded timeout and run the verifier repeatedly in CI.

## Demo and sandbox verification

The sandbox behavior itself passes:

- The landing action enters `/?demo=1` in one click.
- Three distinct “door warning” takes exist, including one approved and one flagged take.
- The banner remains present and says **“Demo — sample data, nothing is saved to your take list.”**
- Demo work uses `demo:line-take-match`; a sentinel in `line-take-match` survived edits, Reset, offline reload, and exit.
- **Reset demo** restored the original note.
- **Start for real** cleared the demo rows and exposed the untouched real sentinel.
- An offline reload retained all three samples.
- Captured demo requests were same-origin or local `blob:` GETs with no request body. No recording or take data left the browser.

The viewport presentation still fails F-3-1.

## Claim test results

Fresh clone: `/tmp/line-take-match-review3.C4R7Ux`, commit `830fd8e60c29e07f377537083d921968202b085b`. Every exact command from `.factory/claims.json` was run independently.

| Claim id | Result | Observable evidence |
| --- | ---: | --- |
| `demo-sandbox` | PASS | Separate database, Reset, exit cleanup, and real sentinel preservation. |
| `local-private` | PASS | Imported audio with only same-origin GET requests and no bodies. |
| `no-voice-services` | PASS | No transcription, generation, or cloning request. |
| `offline-reload` | PASS | Three samples survived a controlled offline reload. |
| `filename-grouping` | PASS | Two numbered WAVs grouped, edited, and persisted after reload. |
| `comparison-cues` | PASS | Level, pace, pauses, and pitch-range deltas appeared for both alternatives. |
| `csv-export` | PASS | Complete header and three rows included a note and measurements. |
| `free-limit` | PASS | Twelve takes and CSV remained available; take 13 was rejected. |
| `studio-backup` | PASS | Recorded USD 1900 offer, 13 takes, and audio data in the exported backup. |
| `billing-api` | PASS | Exact Sociobot checkout/verify routes and invalid-token rejection. |
| `no-tracking` | PASS | No remote script, font, tracker, transcription, or generation resource. |
| `pwa-install` | PASS | Standalone manifest, required icons, and service-worker control. |
| `payment-isolation` | PASS | No payment fields in the app; checkout is the Sociobot link. |
| `license-storage` | PASS | Token and matching current verdict stored in browser storage. |
| `license-states` | PASS | Invalid, revoked, expired, and wrong-product responses kept Studio locked. |
| `comparison-playback` | PASS | Approved sample playback preceded candidate playback. |

No listed claim test failed. F-3-2 is the remaining unlisted claim. The live checkout returned HTTP 303 to Dodo, and the hosted page displayed **“Line Take Match”** and **“$19.00”**.

## Copy audit

Counts use whitespace-delimited words; standalone separators do not count. Hyphenated terms, filenames, prices, and versions count as one word. No sentence exceeds 22 words and no banned marketing word appears.

### Landing prose

| Exact copy | Words | Audit |
| --- | ---: | --- |
| Compare voice takes with an approved take. | 7 | Pass |
| For indie animators and game creators checking whether recorded character lines match. | 12 | Pass |
| The demo opens three dialogue takes to compare. | 8 | Listed claim |
| Audio stays on this device | 5 | Listed claim |
| Works offline after the first visit | 6 | Listed claim |
| Free for 12 takes · Studio costs $19 once | 8 | Listed claims |
| Choose audio files your browser can play. | 7 | Pass |
| If another format fails, convert it to WAV and try again. | 11 | Pass |
| Filenames such as door-warning_take-03.wav group by line. | 7 | Listed claim |
| I have the performer’s consent and rights to review these recordings. | 11 | Pass |
| Import two or more recordings of one line. | 8 | Pass |
| Choose the approved take, then listen to any measured differences. | 10 | Pass |
| Import audio. | 2 | Pass |
| Filenames group takes for the same line. | 7 | Listed claim |
| Choose the approved take. | 4 | Pass |
| Compare level, pace, pauses, and pitch range. | 7 | Listed claim |
| Flag and export. | 3 | Pass |
| Add notes and download a CSV for your team. | 9 | Listed claim |
| Line Take Match does not transcribe, generate, or clone voices. | 10 | Listed claim |
| Measurements are review cues, never performance scores. | 7 | Covered by `comparison-cues` |
| Free mode includes 12 takes and CSV exports. | 8 | Listed claim |
| Studio costs $19 once and adds unlimited takes and audio backups. | 11 | Listed claim |
| Compare recorded voice takes without uploading audio. | 7 | Listed claim |
| Free mode compares up to 12 takes and includes CSV export. | 11 | Listed claim |
| Studio costs $19 once. | 4 | Listed claim |
| It adds unlimited takes and portable project backups. | 8 | F-3-2: portability is unlisted |
| Paste your Studio license token, then verify and restore it. | 10 | Pass |
| Studio checkout opens on Sociobot. | 5 | Covered by `billing-api` |
| A revoked license no longer unlocks Studio. | 8 | Listed claim |
| See privacy and terms. | 4 | Pass |

### Landing headings, facts, and actions

| Exact copy | Words | Audit |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Voice take comparison | 3 | Pass |
| Try it with sample data | 5 | Pass |
| Import audio takes | 3 | Pass |
| 01 / Import | 2 | Pass |
| 12 of 12 free takes remain | 6 | Listed claim |
| 02 / Compare | 2 | Pass |
| Your takes will appear here | 5 | Pass |
| Group takes by filename | 4 | Listed claim |
| Choose the take to compare against | 6 | Pass |
| Flag a take and export CSV | 6 | Pass |
| 03 / Workflow | 2 | Pass |
| Compare recorded takes | 3 | Pass |
| 04 / Boundaries | 2 | Pass |
| Keep the performance human | 4 | Pass |
| 05 / Studio | 2 | Pass |
| Keep larger take lists together | 5 | Pass |
| See Studio details | 3 | Pass |
| Close Studio details | 3 | Pass |
| Studio license | 2 | Pass |
| Keep all your takes together | 5 | Pass |
| Unlimited takes and lines on this device | 7 | Listed claim |
| Download a backup with your audio | 6 | Listed claim |
| Core comparison and CSV stay free | 6 | Listed claims |
| Buy Studio — $19 once | 4 | Pass |
| Have a license? Paste it here | 6 | Pass |
| Verify and restore | 3 | Pass |
| ✓ Approved | 1 | F-3-4: state, not result |
| ⚑ Flagged | 1 | F-3-4: hides the remove result |
| Studio active | 2 | F-3-4: hides the details result |

The demo-specific summary **“1 lines”** is F-3-3. Other demo actions—**“Reset demo,” “Start for real,” “Export CSV,” “Back up project,” “Import backup,” “Play approved, then this take,” “Flag review,”** and **“Remove”**—name their result.

### README

| Exact copy | Words | Audit |
| --- | ---: | --- |
| Compare voice takes with an approved take | 7 | Pass heading |
| Line Take Match helps indie animators and game creators compare recorded dialogue with an approved take. | 16 | Listed claim |
| It measures level, pace, pauses, and pitch range as review cues. | 11 | Listed claim |
| It does not transcribe, generate, clone, or upload voices. | 9 | Listed claims |
| Audio and take data stay in your browser. | 8 | Listed claim |
| After one online visit, you can install the app and use it offline. | 13 | Listed claim |
| Free mode supports 12 takes and CSV export. | 8 | Listed claim |
| Studio costs $19 once. | 4 | Listed claim |
| It adds unlimited takes and backups that include audio. | 9 | Listed claim |
| The demo opens three sample dialogue takes. | 7 | Listed claim |
| It uses separate browser storage and clears that storage when you start for real. | 14 | Listed claim |
| Open the shown local URL. | 5 | Pass |
| Confirm performer consent, then import audio your browser can play. | 10 | Pass |
| If another format fails, convert it to WAV and try again. | 11 | Pass |
| Numbered filenames such as `_take-03` or `_v2` group by line. | 10 | Listed claim |
| You can edit every line. | 5 | Listed claim |
| The production command checks types and builds every page. | 9 | Verified by clean build |
| It then adds the current files to the offline cache. | 10 | Verified by offline test |
| Deploy the generated `dist/` directory. | 5 | Pass instruction |
| The browser suite uses Playwright 1.58.2. | 6 | Verified dependency |
| It covers desktop, 390px mobile, browser storage, accessibility, privacy, and offline reload. | 12 | Verified by 58-test run |
| The live verifier checks the deployed demo, routes, 404, checkout, manifest, isolation, offline reload, focus, mobile layout, and accessibility. | 19 | F-3-5: nondeterministic focus check |
| Recordings, measurements, flags, line names, notes, and licenses stay in browser storage. | 12 | Listed claims |
| The demo uses the separate `demo:line-take-match` database. | 7 | Listed claim |
| CSV exports stay free. | 4 | Listed claim |
| Studio backups contain the audio itself. | 6 | Listed claim |
| Treat them like source recordings. | 5 | Pass safety instruction |
| License verification is the only optional request to Sociobot. | 9 | Covered by billing/privacy claims |
| The app has no analytics, trackers, remote fonts, transcription calls, or generation calls. | 13 | Listed claim |
| Read the privacy policy, terms, research brief, and visual system. | 10 | Pass |
| Deploy `dist/` to an HTTPS static host that serves directory index files. | 12 | Pass instruction |
| Unknown paths must use `404/index.html` with status 404. | 8 | Verified structure instruction |
| The factory owns infrastructure, DNS, and paid-product registration. | 8 | Repository boundary |
| Licensed under the MIT License. | 5 | Verified by `LICENSE` |

README headings **“Run locally”** (2), **“Test and build”** (3), **“Data and privacy”** (3), and **“Deployment”** (1) make sense out of context. The link labels **“Live app”** (2) and **“One-click demo”** (2) identify their destinations.

## History audit

Every prior `.factory/review-*.md`, `.factory/polish-*.md`, `.factory/verification*.md`, and the prior handoff was read. Each prior defect was checked live and in source.

| Earlier id | Round-3 result | Fresh evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Job, audience, demo action, explanation, and three facts fit the cold 390×844 view. |
| F-1-2 | **Half-fixed; reopened as F-3-1** | Sandbox/isolation is fixed, but no actual sample take or comparison appears in the first post-click viewport. |
| F-1-3 / LTM-01 | Fixed | Checkout returns 303 to a hosted Dodo page showing Line Take Match at $19.00. |
| F-1-4 / F-2-1 | Fixed for registered claims | All 16 exact selectors pass and assert the registered outcomes. F-3-2 is a separate unlisted portability promise. |
| F-1-5 | Fixed | Real route documents, full metadata, sitemap, and designed HTTP 404 pass. |
| F-1-6 / LTM-08 | Fixed | Skip links move focus to `#main` on app and legal routes. |
| F-1-7 | Fixed | Literal headings and the terms take, approved take, line, and take list remain consistent. |
| F-1-8 | Fixed | Landing and README sentences remain at or below 22 words. |
| LTM-02 | Fixed | Never-verified tokens stay locked; cached validity remains token-bound. |
| LTM-03 | Fixed | Reference, flag, and line mutations restore keyboard focus in both browser projects. |
| LTM-04 | Fixed | Invalid-license feedback remains visible and announced inside the dialog. |
| LTM-05 | Fixed | Mixed import reports separate success and failure counts. |
| LTM-06 | Fixed | Hashed assets use immutable caching; HTML and service worker remain update-friendly. |
| LTM-07 | Fixed | Tested header/legal targets meet 44 px; no 390px overflow was found. |
| Verification-3 manifest observation | Fixed | Live manifest is `application/manifest+json`. |
| F-2-2 | **Partially fixed; reopened as F-3-2** | Earlier listed privacy/license claims are registered, but “portable project backups” still lacks a tagged restore test. |
| F-2-3 | Product fixed | Internal navigation and Back focus the h1 and announce the title within one frame. The verifier race is F-3-5. |
| F-2-4 | Fixed | Two approved-then-candidate playback actions appear in the demo and the claim test verifies order. |
| F-2-5 | **Half-fixed; reopened as F-3-4** | Default header says “See Studio — $19,” but the licensed state still says “Studio active.” |
| F-2-6 | Fixed | The WAV recovery instruction is concrete and the editable group is called a line. |

## Structure, routing, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | PASS: root uses “Line Take Match — compare recorded voice takes”; Demo, Privacy, Terms, and 404 use route-specific titles under 60 characters. |
| Semantics | PASS: `lang=en`, one h1, one main, landmarks, labels, and ordered headings on every checked route. |
| Metadata | PASS: descriptions, canonicals, OG/Twitter metadata, SVG favicon, 180px Apple icon, and 1200×630 product art are present. |
| Deep links / 404 | PASS: Demo, Privacy, and Terms deep links return 200; an unknown path returns the designed page with HTTP 404. |
| Back button / route focus | PASS in the product after one animation frame; F-3-5 applies to the verifier’s immediate assertion. |
| Link crawl | PASS: all internal destination links returned 200, the intentional unknown path returned 404, Sociobot returned 200, and checkout returned 303. |
| Header/footer | PASS: consistent wordmark, Demo/Privacy navigation, legal links, product line, factory credit, and build id. |
| Accessibility | PASS: axe found zero violations at both viewports on root, Demo, Privacy, Terms, and 404; no mobile overflow; focus and reduced-motion styles are present. |
| Visual identity | PASS: the night-market booth art, near-black lacquer, clipped panels, paper labels, cyan/pink/amber states, and narrow sign typography are distinct and match `.factory/design.md`. |

## Missed leverage

No additional AI feature is justified. The brief is a consent-safe local comparison workflow, and generation, transcription, or remote inference would work against that boundary. CSV export, audio-inclusive backup/import, offline use, and one-action A/B playback already cover the obvious import/export and review loop. No sync requirement is implied by the local-first brief.

## Quality evidence

- Clean clone `npm ci`: passed; zero vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed and produced `dist/index.html`; initial app JavaScript is 30.67 KB raw / 11.35 KB gzip.
- All 16 exact claim commands: passed independently.
- `npm run test:e2e -- --workers=1`: 58/58 passed across desktop and 390px mobile.
- Worker `verify-url.sh`: root, Demo, Privacy, and Terms passed with no console errors, one h1, one main, `lang`, title, alt text, and named buttons.
- Independent axe scans: zero violations on all five checked routes at both viewports.
- Live demo: isolation, Reset, exit cleanup, offline reload, and same-origin/no-body request checks passed.
- `npm run verify:live`: nondeterministic, two passes and three F-3-5 failures across five clean-clone runs.

## What would make this perfect

Put an actual approved-versus-candidate comparison in the first demo viewport, correct **“1 line,”** and make every stateful control name the result of pressing it. Register and test project-backup portability by restoring into a clean context. Finally, make the live route-focus assertion wait for the scheduled focus change. Re-run this full cold-read, claim, sandbox, route, link, accessibility, and history audit; PASS requires zero findings.
