# Adversarial first-read review 4 — Line Take Match

**Verdict: PASS.** No blocking, major, or minor findings remain. This review was performed against <https://line-take-match.sociobot.in> on 2026-08-28 from fresh Chromium contexts at 390 × 844 and 1440 × 960, then against a fresh local clone at `a68160c`.

## 30-second cold read

| Question | Cold-read answer | Visible evidence |
| --- | --- | --- |
| What does it do? | It compares recorded voice takes with one approved take. | “Compare voice takes with an approved take.” |
| Who is it for? | Indie animators and game creators checking character-line consistency. | “For indie animators and game creators checking whether recorded character lines match.” |
| What should I click first? | **Try it with sample data**. | The cyan primary action is adjacent to “The demo opens three dialogue takes to compare.” |

The visual hierarchy makes the sample action primary and the real import route secondary. The night-booth illustration, clipped labels, cyan/magenta/amber measurements, and dark lacquer palette implement the documented product-specific identity; this is not a generic SaaS card layout.

## Copy audit

Counts are whitespace-delimited. This is the complete cold landing copy, including headings, actions, facts, empty state, workflow, boundaries, Studio, and footer. “Listed” means the statement maps to `.factory/claims.json`; labels and action names are not claims.

| Location | Copy | Words | Check |
| --- | --- | ---: | --- |
| Header | Skip to main content | 4 | Clear |
| Header | Line Take Match | 3 | Clear |
| Header | Demo | 1 | Clear |
| Header | Privacy | 1 | Clear |
| Header | See Studio — $19 | 3 | Result-naming verb |
| Hero | Voice take comparison | 3 | Clear |
| Hero h1 | Compare voice takes with an approved take. | 7 | Clear |
| Hero | For indie animators and game creators checking whether recorded character lines match. | 12 | Clear |
| Hero action | Try it with sample data | 5 | Result-naming verb |
| Hero action | Import audio takes | 3 | Result-naming verb |
| Hero | The demo opens three dialogue takes to compare. | 8 | Listed |
| Hero fact | Audio stays on this device | 5 | Listed |
| Hero fact | Works offline after the first visit | 6 | Listed |
| Hero fact | Free for 12 takes · Studio costs $19 once | 8 | Listed |
| Import | Import audio takes | 3 | Clear |
| Import | Choose audio files your browser can play. | 7 | Clear |
| Import | If another format fails, convert it to WAV and try again. | 11 | Clear recovery step |
| Import | Filenames such as door-warning_take-03.wav group by line. | 7 | Listed |
| Import | I have the performer’s consent and rights to review these recordings. | 11 | Clear |
| Import | 12 of 12 free takes remain | 6 | Listed |
| Empty state | Your takes will appear here | 5 | Clear |
| Empty state | Import two or more recordings of one line. | 8 | Clear |
| Empty state | Choose the approved take, then listen to any measured differences. | 10 | Clear |
| Empty action | Import a project backup | 4 | Result-naming verb |
| Empty workflow | Group takes by filename | 4 | Listed |
| Empty workflow | Choose the take to compare against | 6 | Clear |
| Empty workflow | Flag a take and export CSV | 6 | Result-naming verb; export listed |
| Workflow | Compare recorded takes | 3 | Clear |
| Workflow | Import audio. | 2 | Clear |
| Workflow | Filenames group takes for the same line. | 7 | Listed |
| Workflow | Choose the approved take. | 4 | Clear |
| Workflow | Compare level, pace, pauses, and pitch range. | 7 | Listed |
| Workflow | Flag and export. | 3 | Clear |
| Workflow | Add notes and download a CSV for your team. | 9 | Listed |
| Boundary | Keep the performance human | 4 | Clear |
| Boundary | Line Take Match does not transcribe, generate, or clone voices. | 10 | Listed |
| Boundary | Measurements are review cues, never performance scores. | 7 | Listed |
| Studio | Keep larger take lists together | 5 | Clear |
| Studio | Free mode includes 12 takes and CSV exports. | 8 | Listed |
| Studio | Studio costs $19 once and adds unlimited takes and audio backups. | 11 | Listed |
| Studio action | See Studio details | 3 | Result-naming verb |
| Footer | Compare recorded voice takes without uploading audio. | 7 | Listed |
| Footer | Privacy | 1 | Clear |
| Footer | Terms | 1 | Clear |
| Footer | Built by Param Factory | 4 | Clear |
| Footer | v1.1.0 · polish-3 | 2 | Build label |

The complete README copy also stays within the 22-word limit. Commands and URLs are included as readable copy units.

| README location | Copy | Words | Check |
| --- | --- | ---: | --- |
| Title | Compare voice takes with an approved take | 7 | Clear |
| Intro | Line Take Match helps indie animators and game creators compare recorded dialogue with an approved take. | 16 | Listed purpose |
| Intro | It measures level, pace, pauses, and pitch range as review cues. | 11 | Listed |
| Intro | It does not transcribe, generate, clone, or upload voices. | 9 | Listed |
| Intro | Audio and take data stay in your browser. | 8 | Listed |
| Intro | After one online visit, you can install the app and use it offline. | 13 | Listed |
| Intro | Free mode supports 12 takes and CSV export. | 8 | Listed |
| Intro | Studio costs $19 once. | 4 | Listed |
| Intro | It adds unlimited takes and backups that include audio. | 9 | Listed |
| Link label | Live app | 2 | Clear |
| Link label | One-click demo | 2 | Clear |
| Demo | The demo opens three sample dialogue takes. | 7 | Listed |
| Demo | It uses separate browser storage and clears that storage when you start for real. | 14 | Listed |
| Heading | Run locally | 2 | Clear |
| Command | npm ci | 2 | Clear |
| Command | npm run dev | 3 | Clear |
| Run | Open the shown local URL. | 5 | Clear |
| Run | Confirm performer consent, then import audio your browser can play. | 10 | Clear |
| Run | If another format fails, convert it to WAV and try again. | 11 | Clear recovery step |
| Run | Numbered filenames such as _take-03 or _v2 group by line. | 10 | Listed |
| Run | You can edit every line. | 5 | Listed |
| Heading | Test and build | 3 | Clear |
| Command | npm test | 2 | Clear |
| Command | npm run build | 3 | Clear |
| Command | npm run test:claims | 3 | Clear |
| Command | npm run test:e2e | 3 | Clear |
| Command | npm run verify:live | 3 | Clear |
| Build | The production command checks types and builds every page. | 9 | Developer instruction |
| Build | It then adds the current files to the offline cache. | 10 | Developer instruction |
| Build | Deploy the generated dist/ directory. | 5 | Developer instruction |
| Test | The browser suite uses Playwright 1.58.2. | 6 | Developer instruction |
| Test | It covers desktop, 390px mobile, browser storage, accessibility, privacy, and offline reload. | 12 | Developer instruction |
| Test | The live verifier checks the deployed demo, routes, 404, checkout, manifest, isolation, offline reload, focus, mobile layout, and accessibility. | 19 | Developer instruction |
| Heading | Data and privacy | 3 | Clear |
| Privacy | Recordings, measurements, flags, line names, notes, and licenses stay in browser storage. | 12 | Listed |
| Privacy | The demo uses the separate demo:line-take-match database. | 7 | Listed |
| Privacy | CSV exports stay free. | 4 | Listed |
| Privacy | Studio backups include audio and can restore a take list in another browser. | 13 | Listed |
| Privacy | License verification is the only optional request to Sociobot. | 9 | Listed |
| Privacy | The app has no analytics, trackers, remote fonts, transcription calls, or generation calls. | 13 | Listed |
| Read | Read the privacy policy, terms, research brief, and visual system. | 10 | Clear |
| Heading | Deployment | 1 | Clear |
| Deployment | Deploy dist/ to an HTTPS static host that serves directory index files. | 12 | Developer instruction |
| Deployment | Unknown paths must use 404/index.html with status 404. | 8 | Developer instruction |
| Deployment | The factory owns infrastructure, DNS, and paid-product registration. | 8 | Scope statement |
| License | Licensed under the MIT License. | 5 | Clear |

No phrase uses a banned marketing adjective. Product nouns are consistent: **take list**, **take**, **approved take**, **line**, **review cue**, **backup**, and **demo**. No heading needs adjacent context to make sense, and all visible buttons name their result or an explicit next state.

## Demo and sandbox

The hero's one-click action opens `/?demo=1`. The first 390 px screen already contains a working sample: approved `door-warning_take-01`, candidate `door-warning_take-02`, a +3.4 dB comparison, and **Play approved, then this take**. The board immediately shows three realistic named takes, four measured review cues, one flag, and CSV export.

The persistent banner reads “Demo — sample data, nothing is saved to your take list” and provides **Reset demo** plus **Start for real**. In a fresh context, the only opened IndexedDB database was `demo:line-take-match`; the normal database was absent. The registered sandbox test then preserved a normal-list sentinel, reset the three samples, cleared demo rows on exit, and reloaded the sample list offline. Network interception tests cover local analysis, no-upload/no-voice-services, and no-tracking behavior.

## Claims

`.factory/claims.json` has 16 entries. In a fresh clone at `/tmp/line-take-match-review4.efh1et`, `npm ci` followed by `npm run test:claims` passed all 16 tagged claim selectors in 38.2 seconds. The retried exact `@claim:no-voice-services` command also passed.

| Claim id | Result |
| --- | --- |
| demo-sandbox | Pass |
| local-private | Pass |
| no-voice-services | Pass |
| offline-reload | Pass |
| filename-grouping | Pass |
| comparison-cues | Pass |
| csv-export | Pass |
| free-limit | Pass |
| studio-backup | Pass |
| billing-api | Pass |
| no-tracking | Pass |
| pwa-install | Pass |
| payment-isolation | Pass |
| license-storage | Pass |
| license-states | Pass |
| comparison-playback | Pass |

Cross-checking the rendered landing page and README found no unlisted visitor-reliance claim. The pricing, backup, license, local-processing, tracking, offline, grouping, metrics, and playback statements all map to the registry. Legal caveats on Privacy and Terms describe policy and usage constraints rather than untested product promises.

## History check

Every earlier review, polish report, verification report, and the previous handoff was read. The table records a fresh live/code confirmation rather than accepting a prior “fixed” label.

| Earlier finding | Fresh confirmation |
| --- | --- |
| F-1-1 | Fixed: phone hero states task, audience, sample action, next result, privacy, offline, and price. |
| F-1-2 / F-3-1 | Fixed: isolated one-click demo has a visible first-screen comparison, banner, reset, exit cleanup, and offline sample. |
| F-1-3 / LTM-01 | Fixed: live checkout returns HTTP 303 to the hosted Sociobot/Dodo flow. |
| F-1-4 / F-2-1 | Fixed: 16 registered outcome tests pass from a fresh clone. |
| F-1-5 | Fixed: real demo/legal routes, route metadata, sitemap, and designed 404 return correct responses. |
| F-1-6 / LTM-08 | Fixed: skip link transfers focus to `#main`. |
| F-1-7 | Fixed: literal task headings and consistent take/line terminology remain. |
| F-1-8 | Fixed: every audited landing and README copy unit is at or below 22 words. |
| LTM-02 | Fixed: cached validity is token-bound; a never-verified token cannot unlock Studio offline. |
| LTM-03 | Fixed: reference, flag, and line mutations retain equivalent keyboard focus. |
| LTM-04 | Fixed: invalid-license feedback remains visible, announced, and inside the dialog. |
| LTM-05 | Fixed: mixed imports report separate successful and failed counts. |
| LTM-06 | Fixed: hashed assets are immutable while HTML and the worker stay update-friendly. |
| LTM-07 | Fixed: tested home/legal/mobile controls meet the 44 px target. |
| F-2-2 / F-3-2 | Fixed: all public privacy, install, payment, license, and portable-backup promises are registered and tested. |
| F-2-3 | Fixed: internal navigation and browser Back focus the h1 and announce the route. |
| F-2-4 | Fixed: the local approved-then-candidate control performs the stated playback order. |
| F-2-5 / F-3-4 | Fixed: buttons use “See Studio,” “Manage Studio license,” “Flag review,” and “Remove review flag”; “Approved take” is a status. |
| F-2-6 | Fixed: WAV guidance gives a concrete recovery step and editable groups are consistently called lines. |
| F-3-3 | Fixed: demo summary correctly reads “1 line.” |
| F-3-5 | Fixed: the live route-focus verifier uses bounded polling and passed in this run. |

## Structure, routing, and accessibility

Live checks covered `/`, `/demo/`, `/privacy/`, `/terms/`, and a nonexistent route. Each has one h1, an appropriate title, meta description, canonical, Open Graph image, favicon, `lang="en"`, common header/footer, and Privacy/Terms links. Results: all normal routes returned 200; the nonexistent route returned the designed “This page missed its cue.” page with status 404. Internal links resolved successfully (the current-page skip link on the 404 naturally retains the current 404 status), the external checkout returned 303, and Sociobot's external contact link returned 200.

`npm run verify:live` reported zero console errors, zero serious axe violations on every public route, route-specific titles, demo first-viewport proof, reset and real-storage isolation, offline reload, checkout behavior, and the manifest MIME type. The full local suite also passed: `npm test` 13/13, `npm run build`, and `npm run test:e2e -- --workers=1` 60/60. The initial JavaScript bundle is 11.53 KB gzip, below the 150 KB static-product target.

## Missed leverage

No finding. The brief calls for local comparison, CSV handoff, and consent-safe review rather than generation or transcription. Import, editable grouping, comparison playback, CSV export, and portable Studio backup are present. An AI feature would weaken the stated local, human-performance boundary; no provider key or decorative AI feature is present.

## What would make this perfect

Maintain the existing tested boundaries as future changes are made: keep any new visitor-reliance statement paired with a sandbox claim test, preserve the one-click isolated demo, and retest the phone first view after visual changes. There is no outstanding product change required by this review.
