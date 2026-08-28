# First-read review 1 — Line Take Match

**Verdict: FAIL**

Reviewed 2026-08-28 UTC against commit `c52b986be26ff646eead2802f2f6026b0c1413a8` and the live site at <https://line-take-match.sociobot.in>. This was a fresh, unauthenticated Chromium visit at 390×844 and 1280×800, followed by a fresh remote clone. No product code was changed.

## 30-second cold read

Before scrolling on mobile, I could infer that this is intended to compare a recorded voice take with an approved one. I could **not** determine the named audience from the first screen: it says “your performer,” but not indie animators or game creators. I also could not determine what to click first. The only visible action at 390×844 is **“Unlock studio”**; the file-import control is below the fold and there is no sample-demo action.

The exact headline that fails the cold read is **“HEAR THE LINE. SEE THE DRIFT.”** It is a metaphor, not the job. “Drift” is not defined until the visitor interprets the later measurement copy. Desktop has the same ambiguity, even though more of the start of the import panel is visible.

## Findings

### F-1-1 — BLOCKING — The mobile first screen does not state the job, audience, and first action plainly

**Location / quote:** mobile hero: “HEAR THE LINE. SEE THE DRIFT.”; “Match level, pace, pauses, and pitch movement against the take your performer approved.” The only visible control is “Unlock studio.”

**Why this fails first read:** The headline is not a task in the visitor’s words. “Drift” and “take” assume context, the actual audience is absent, and the displayed action asks for payment before the product has been tried. A first-time visitor cannot safely choose a first action in 30 seconds.

**Concrete fix:** Replace the hero with a ≤9-word job headline such as **“Compare voice takes with an approved take.”** Use a ≤22-word audience sentence such as **“For indie animators and game creators checking whether recorded character lines match.”** Put **“Try it with sample data”** in the first viewport, next to “Import audio takes,” and state “Opens three sample dialogue takes to compare.”

### F-1-2 — BLOCKING — There is no one-click demo, and the advertised demo URL writes to real storage

**Evidence:** There is no “Try it with sample data” action on `/`. Visiting `/demo` returns the ordinary empty app. Visiting `/?demo=1` returns the ordinary empty app (`0` take cards, `0` matching demo banners). After importing a disposable WAV on `?demo=1`, the browser reports only the normal IndexedDB name `line-take-match`; after an offline reload the imported real take remains. Source confirms a single `DB_NAME = 'line-take-match'` in `src/db.ts` and no demo mode or `.factory/demo.md` exists.

**Why this fails first read and privacy:** A visitor cannot evaluate the product without supplying recordings. More seriously, the required verifier URL does not isolate data, so demo-mode activity would persist beside real work rather than in a `demo:` namespace.

**Concrete fix:** Implement `/demo` (and `?demo=1`) with at least realistic, preloaded dialogue takes and the comparison UI already populated. Show a persistent **“Demo — sample data, nothing is saved”** banner with **“Reset demo”** and **“Start for real.”** Store only demo activity in a separately named `demo:` IndexedDB/localStorage namespace, discard it on exit, and document the URL, sample, reset behavior, and namespace in `.factory/demo.md`. Add browser tests proving that demo data never reads or writes normal storage.

### F-1-3 (prior LTM-01) — BLOCKING — The advertised Studio purchase link is dead

**Location / quote:** landing/dialog link **“Buy Studio — $19 once”** points to `https://api.sociobot.in/api/v1/products/line-take-match/checkout`.

**Evidence:** A fresh `GET` to that exact URL returned **HTTP 404** on 2026-08-28 UTC. The landing-link crawl returned 200 for every internal link and 404 for this one.

**Why this misleads:** The product advertises a purchasable $19 unlock but a customer cannot begin checkout. This is the same unresolved release blocker recorded as `LTM-01` in both earlier verification reports; it is not merely marked fixed in the repository.

**Concrete fix:** Enable/register the production `line-take-match` Sociobot product and its HTTPS return URL, then verify a live hosted checkout, return token, valid token, invalid token, revoked token, and first-use/cached-valid offline behavior.

### F-1-4 — BLOCKING — Required claim registry and claim tests are absent

**Location / quote:** `.factory/claims.json` does not exist. `rg '@claim:'` found no claim-tagged test.

**Evidence:** The required per-claim test commands therefore cannot be run from a clean clone. `npm ci`, `npm test` (11/11), `npm run build`, and `npm run test:e2e` (14/14) pass in a fresh clone, but none is a declared claim test.

**Unlisted claims needing individual registry entries and observable sandbox tests:**

| Where | Exact claim-like copy |
|---|---|
| Landing | “Match level, pace, pauses, and pitch movement against the take your performer approved.” |
| Landing | “Nothing is uploaded.” |
| Landing | “Nothing is cloned.” |
| Landing | “On-device analysis” |
| Landing | “Review cues, not scores” |
| Landing | “Names like door-warning_take-03.wav group automatically.” |
| Landing | “12 of 12 free slots remain” |
| Landing | “Import two or more takes of a line.” |
| Landing | “Flag mismatches and export the handoff” |
| Landing | “Hero scene is original AI-generated artwork.” |
| README | “Line Take Match is a private, local-first takeboard for indie animators and game creators.” |
| README | “Import creator-owned dialogue takes, group them by line, choose the approved reference, compare level/pace/pause/pitch-range cues, flag mismatches, and export a handoff CSV.” |
| README | “It does not transcribe, generate, or clone voices.” |
| README | “All audio analysis and project storage happens in the browser.” |
| README | “The installable PWA works offline after its first load.” |
| README | “Free mode supports 12 takes with unlimited CSV exports; the optional $19 one-time Studio license adds unlimited takes and audio-inclusive project backups through Sociobot billing.” |
| README | “Filenames ending in patterns such as `_take-03` or `_v2` are grouped automatically; every line assignment remains editable.” |
| README | “Recordings, metrics, flags, line labels, notes, and licenses stay in browser storage.” |
| README | “Audio decoding and measurements use the Web Audio API on-device.” |
| README | “CSV exports remain free.” |
| README | “Studio JSON backups contain the audio itself; treat them like source recordings.” |
| README | “The only optional API request verifies a Studio license with Sociobot.” |
| README | “There are no analytics, trackers, third-party fonts, runtime CDNs, transcription calls, or generation calls.” |

**Concrete fix:** Add `.factory/claims.json` entries and exactly one `@claim:<id>` fresh-demo test for each kept claim. The privacy claim must intercept the whole demo flow and assert same-origin traffic only; the offline claim must load `/demo`, obtain service-worker control, set the context offline, reload, and retain the sample board; the CSV, grouping, free-limit, analysis, and license claims need observable result assertions. Remove any promise that cannot be tested.

### F-1-5 — MAJOR — The promised routes and site metadata are incomplete; unknown URLs masquerade as the app

**Evidence:** `/demo` returns HTTP 200 but renders the ordinary root app, not a demo. `/not-a-real-page` also returns HTTP 200 with the ordinary root title and headline, not a designed 404. Root, Privacy, and Terms have no canonical link, Open Graph tags, Twitter-card tags, or Apple touch icon. Privacy and Terms also have no meta description. `sitemap.xml` omits `/demo`. Legal pages have no skip link and do not use the required shared header/footer; their footer omits the product one-liner, “Built by Param Factory,” and build/version identifier.

**Why this matters:** A shared navigation fallback is not a real route or 404. A visitor following a bad link sees a plausible product page instead of a recovery path, and shared navigation/accessibility differs by route.

**Concrete fix:** Add a real `/demo` and a styled `/404` with a Home action; configure unknown paths to use it with an appropriate 404 status. Supply route-specific descriptions, canonical, OG/Twitter title/description/image, and Apple touch icon; include `/demo` in the sitemap. Give every route the same skip link, wordmark/header navigation, and required footer content.

### F-1-6 (prior LTM-08) — MINOR — The skip link scrolls but does not move focus

**Location / quote:** “Skip to takeboard” links to `#main`.

**Evidence:** On a fresh live mobile visit, activating the link changed the hash to `#main`, but `document.activeElement` became `BODY`; `<main id="main">` has no `tabindex`.

**Why this matters:** Keyboard and screen-reader users do not land at a predictable reading location. This is the unresolved `LTM-08` reported in the prior verification.

**Concrete fix:** Make the main landmark programmatically focusable (normally `tabindex="-1"`) and explicitly focus it after skip-link activation; retain the browser regression test.

### F-1-7 — MINOR — Landing headings use unexplained metaphors and inconsistent nouns

**Location / quote:** “HEAR THE LINE. SEE THE DRIFT.”; “DROP IN A SESSION”; “YOUR CUE SHEET IS QUIET.” The same work is called a “takeboard,” “session,” and “cue sheet.”

**Why this fails plain language:** None of these headings says the task without surrounding copy. “Session” and “cue sheet” introduce new nouns for the same collection of takes.

**Concrete fix:** Use one term consistently, for example **“take list.”** Rewrite the headings as **“Compare recorded takes,” “Import audio takes,”** and **“Your takes will appear here.”**

### F-1-8 — MINOR — README sentences exceed the 22-word cap and leave public claims in jargon

**Location / quote:**

- 25 words: “Free mode supports 12 takes with unlimited CSV exports; the optional $19 one-time Studio license adds unlimited takes and audio-inclusive project backups through Sociobot billing.”
- 28 words: “It type-checks the app, builds all entry points, injects the versioned offline precache list, and writes the deployable static site to `dist/` with `dist/index.html` at its root.”
- Jargon: “installable PWA,” “precache,” “IndexedDB,” “Web Audio API,” and “local-first takeboard.”

**Why this matters:** The README is product copy under the supplied plain-words contract. The price sentence makes the free/paid boundary harder to scan; technical terms appear before they are explained.

**Concrete fix:** Split the price copy into: **“Free mode includes 12 takes and CSV exports. Studio costs $19 once and adds unlimited takes and audio backups.”** Replace the build sentence with two short developer sentences. Define or replace public-facing jargon: for example, “an app you can install,” “browser storage,” and “audio analysis in your browser.”

## Copy audit

Word counts treat a hyphenated item, filename, command, or numeric value as one token. “Flag” below means a concrete plain-words issue; “claim” is cross-referenced to F-1-4.

### Landing page (all visible copy units)

| Location | Copy | Words | Audit |
|---|---|---:|---|
| Skip link | Skip to takeboard | 3 | Jargon: use “Skip to main content.” |
| Wordmark | LT / Line Take Match | 1 / 3 | — |
| Status | Local mode | 2 | Ambiguous; say “Saved on this device.” |
| Button | Unlock studio | 2 | Not the first action; keep secondary. |
| Eyebrow | Private take comparison | 3 | Jargon: define “takes” in headline/subline. |
| H1 | Hear the line. | 3 | Flag F-1-1/F-1-7. |
| H1 | See the drift. | 3 | Flag F-1-1/F-1-7. |
| Hero | Match level, pace, pauses, and pitch movement against the take your performer approved. | 13 | Claim; “pitch movement” is jargon. |
| Hero | Nothing is uploaded. | 3 | Claim. |
| Hero | Nothing is cloned. | 3 | Claim. |
| Fact | On-device analysis | 2 | Claim/jargon. |
| Fact | Creator-owned audio | 2 | Plain but fragment. |
| Fact | Review cues, not scores | 4 | Claim; explain what a cue is. |
| Import label | 01 / Bring your takes | 4 | “takes” needs first-read context. |
| H2 | Drop in a session | 4 | Flag F-1-7. |
| Import help | WAV, MP3, M4A, OGG, or FLAC. | 6 | — |
| Import help | Names like door-warning_take-03.wav group automatically. | 5 | Claim; spell out “filenames.” |
| Consent | I have the performer’s consent and rights to review these recordings. | 10 | — |
| File action | Choose audio or drop files here | 6 | Flag: use “Import audio takes.” |
| Free limit | 12 of 12 free slots remain | 6 | Claim; “slots” is vague. |
| Empty-state label | 02 / Compare | 2 | — |
| H2 | Your cue sheet is quiet | 5 | Flag F-1-7. |
| Empty state | Import two or more takes of a line. | 9 | Claim. |
| Empty state | Pick the approved performance as reference, then use the measurement differences to guide a human listen. | 16 | “reference” needs a definition. |
| Step | Group takes by filename | 4 | Claim. |
| Step | Choose an approved reference | 4 | Jargon: say “Choose the take to compare against.” |
| Step | Flag mismatches and export the handoff | 6 | Claim; “handoff” is jargon. |
| Footer | Built for human direction, not voice imitation. | 7 | Plain. |
| Footer | Hero scene is original AI-generated artwork. | 7 | Provenance claim. |
| Legal links | Privacy / Terms | 1 / 1 | — |

The closed unlock dialog is also landing-page DOM copy. Its action labels are result-naming verbs except for the close glyph: **“Buy Studio — $19 once”** (5) and **“Verify and restore”** (3) are clear. Its non-sentence headings **“Keep the whole session together”** (5) and **“Audio-inclusive JSON project backup”** (4) repeat the undefined “session” term and use technical jargon; rewrite them as **“Keep all your takes together”** and **“Download a backup with your audio.”** Its remaining sentences and sentence-like list items are audited here:

| Dialog copy | Words | Audit |
|---|---:|---|
| Free mode compares up to 12 takes and always includes CSV export. | 12 | Claim; clear but needs F-1-4 test. |
| A $19 one-time purchase adds unlimited takes and portable project backups. | 11 | Claim; blocked by F-1-3. |
| No subscription. | 2 | Claim. |
| Unlimited local takes and lines | 5 | Claim; “local” is ambiguous. |
| Audio-inclusive JSON project backup | 4 | Flagged jargon. |
| Core comparison and CSV stay free | 6 | Claim. |
| Have a license? Paste it here | 6 | Clear action. |
| Paste your Studio license token, then verify and restore it. | 9 | Clear action. |
| Sociobot/Dodo is the merchant of record. | 7 | Legal/provider claim. |
| Refunds are handled there and revoke the license. | 8 | Legal/product claim. |
| See privacy and terms. | 4 | Clear links. |

### README (all sentences and sentence-like instructions)

| Location | Copy | Words | Audit |
|---|---|---:|---|
| Title | Line Take Match | 3 | Product name, not a task. |
| Intro | Line Take Match is a private, local-first takeboard for indie animators and game creators. | 14 | Claim; “local-first takeboard” is jargon. |
| Intro | Import creator-owned dialogue takes, group them by line, choose the approved reference, compare level/pace/pause/pitch-range cues, flag mismatches, and export a handoff CSV. | 22 | Claim; dense jargon (“reference,” “cues,” “handoff”). |
| Intro | It does not transcribe, generate, or clone voices. | 8 | Claim. |
| Intro | All audio analysis and project storage happens in the browser. | 9 | Claim. |
| Intro | The installable PWA works offline after its first load. | 9 | Claim/jargon. |
| Intro | Free mode supports 12 takes with unlimited CSV exports; the optional $19 one-time Studio license adds unlimited takes and audio-inclusive project backups through Sociobot billing. | 25 | Flag F-1-8; claim. |
| Run | Open the Vite URL, confirm that you have the performer’s consent, and import WAV, MP3, M4A, OGG, or FLAC files. | 20 | “Vite” is necessary developer jargon; split the consent/product instruction from it. |
| Run | Filenames ending in patterns such as `_take-03` or `_v2` are grouped automatically; every line assignment remains editable. | 17 | Claim. |
| Test | `npm run build` is the exact production command. | 6 | Developer statement. |
| Test | It type-checks the app, builds all entry points, injects the versioned offline precache list, and writes the deployable static site to `dist/` with `dist/index.html` at its root. | 28 | Flag F-1-8; split. |
| Test | The browser suite uses Playwright 1.58.2 and exercises desktop, 390px mobile, IndexedDB persistence, accessibility, and offline reload. | 17 | “IndexedDB” jargon; a test claim needs F-1-4 tagging. |
| Privacy | Recordings, metrics, flags, line labels, notes, and licenses stay in browser storage. | 10 | Claim. |
| Privacy | Audio decoding and measurements use the Web Audio API on-device. | 10 | Claim/jargon. |
| Privacy | CSV exports remain free. | 4 | Claim. |
| Privacy | Studio JSON backups contain the audio itself; treat them like source recordings. | 12 | Product/safety claim. |
| Privacy | The only optional API request verifies a Studio license with Sociobot. | 11 | Claim. |
| Privacy | There are no analytics, trackers, third-party fonts, runtime CDNs, transcription calls, or generation calls. | 15 | Claim. |
| Deployment | Deploy the contents of `dist/` to any HTTPS static host with clean-directory paths enabled. | 14 | Developer instruction; “clean-directory” needs an example. |
| Deployment | The factory owns infrastructure, DNS, and registration of the paid product; this repository does not provision them. | 14 | Relevant, but the registered product is currently unavailable (F-1-3). |
| License | Licensed under the MIT License. | 6 | — |

## Checks completed

- Fresh cold browser contexts: 390×844 mobile and 1280×800 desktop; no console errors on initial load.
- Demo/privacy/offline exercise: `?demo=1` had no sample or banner, used normal IndexedDB, persisted an imported take across offline reload, and made no non-GET/upload request. This validates the absence of sandboxing, not the copy’s privacy claim.
- Fresh remote clone at `c52b986`: `npm ci` passed; `npm test` 11/11; `npm run build` passed and produced `dist/`; `npm run test:e2e` 14/14. No listed claim command existed because `claims.json` is missing.
- Link crawl: root, privacy, terms, and anchors returned 200; Studio checkout returned 404.
- Live route/metadata checks: title/lang/one h1/main present on root, Privacy, and Terms; all three lack canonical/OG/Twitter/Apple touch metadata. `/demo` and an unknown URL render the root app.
- Live mobile axe scan: zero violations on root, Privacy, and Terms. This does not fix the separately reproduced skip-focus defect.
- History: all earlier `.factory/verification*.md` and the prior handoff were read. `LTM-01` and `LTM-08` remain reproducible. Earlier resolved issues (`LTM-02` through `LTM-07`) were not re-raised: the fresh suite passed the related license, focus-on-mutation, mixed-import, and target-size regressions.

## What would make this perfect

The product should let a cold visitor press one visible demo button and immediately compare realistic takes without risking any personal storage. The landing then needs one plain sentence that names the user and job, a working purchase route, a complete claim-to-test registry, and route/metadata/404 polish. At that point, re-run the same fresh demo, offline, privacy-interception, link, mobile, and clean-clone checks until there are zero findings.
