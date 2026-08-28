# Independent product verification — Line Take Match

## Verdict: FAIL

Candidate `7a47fb8f6d29433db83e2df7f8e20a0d5f95aa10` was independently tested on 2026-08-28 UTC against the researched brief and factory acceptance contract. The live site at <https://line-take-match.sociobot.in> is deployed and is byte-for-byte the candidate build, but the paid path is not releasable: checkout returns 404 and a never-verified token unlocks Studio when verification is unavailable.

The free, local-first take-comparison workflow is otherwise functional, accessible in automated checks, fast, and offline-capable.

## Scope and method

- Fresh remote clone, detached checkout at the exact candidate SHA; the working repository was not used as evidence for build reproducibility.
- Node `v22.23.2`, npm lockfile install, Playwright `1.58.2`, bundled Chromium `145.0.7632.6`, Lighthouse `12.8.2`.
- Production output served with `vite preview`; live checks used the public HTTPS URL.
- Desktop Chromium at 1280×800 and mobile Chromium at 390×844.
- No product code was changed. Independent browser fixtures lived outside the submitted working tree.

## Repository gates

| Gate | Result | Evidence |
|---|---:|---|
| Clean candidate checkout | PASS | Detached `HEAD` exactly `7a47fb8f6d29433db83e2df7f8e20a0d5f95aa10`; clean before testing. |
| `npm ci` | PASS | 60 packages installed; npm audit reported 0 vulnerabilities. |
| `npm test` | PASS | Vitest: 1 file, 6/6 tests passed. |
| Type check | PASS | Strict TypeScript `tsc` is the first stage of the exact build and completed with no errors. |
| Lint | N/A | No lint script or lint configuration exists in the candidate. |
| `npm run build` | PASS | Exact command `tsc && vite build && node scripts/inject-sw.mjs`; produced `dist/`. |
| `npm run test:e2e` | PASS | Playwright: 4/4 across desktop and 390px mobile. |

## End-to-end product evidence

Normal workflow passed with generated, valid PCM WAV fixtures: consent, multi-file import, filename grouping, local analysis, reference selection, level/duration/pause/pitch-range deltas, flagging, line and note editing, search/no-results recovery, audio presence, persistence across reload, and CSV download.

- The brief's 40-line target was exercised in Studio mode with a mocked valid Sociobot verification response: 40 distinct takes analyzed into 40 lines in 3.442 seconds, five lines flagged, a 41-row CSV exported, and all state survived reload.
- CSV contained reference, flag, note, and measurement data. Values beginning with `=`, `+`, `-`, or `@` were apostrophe-prefixed to prevent spreadsheet formula execution.
- A Studio JSON backup contained the audio as a data URL; an invalid backup was rejected with a specific message; a valid backup restored its take.
- Remove cancellation preserved the take; confirmed removal succeeded; Undo restored it; the restored state persisted.
- Free boundary: 12 takes accepted; the 13th was blocked with the stated limit and an unlock route. CSV remained available.
- Unsupported text and corrupt WAV inputs produced actionable errors. A later valid import recovered.
- Mixed batch issue: one valid WAV plus one corrupt WAV resulted in 41 total takes from a prior 40, while the success toast incorrectly said “2 files processed locally.” See LTM-05.

## Live deployment identity and behavior

- `/` returned HTTP 200 over valid TLS.
- All 20 files in the clean candidate's `dist/` were downloaded from their corresponding live paths and compared with SHA-256: **20/20 exact matches, 0 mismatches**. This includes HTML, JS, CSS, source maps, service worker, manifest, icons, art, legal pages, robots, and sitemap.
- A fresh live-browser run imported one WAV, persisted it, obtained service-worker control, switched offline, reloaded, and still showed the take.
- Live Chromium reported zero manifest parse errors, zero console warnings/errors, zero page errors, zero cross-origin requests in the free workflow, and zero request bodies/uploads.
- The public checkout endpoint was tested without following redirects at 2026-08-28T05:43:35Z. Both HEAD and GET returned HTTP 404 with `{"error":"enabled factory product","status":404}`. See LTM-01.
- The public verify endpoint responded HTTP 200/no-store to an invalid token with `{"valid":false,"reason":"invalid","expires_at":null}` and allowed the production origin via CORS.

## Privacy and security

- Browser traffic confirmed that audio import, analysis, persistence, playback, flags, notes, search, and CSV export caused no upload or cross-origin request.
- Source and built-output review found no analytics, ads, fingerprinting, transcription, generation calls, CDN scripts, or external fonts. The only coded runtime API is the expected Sociobot license verification endpoint; checkout is a plain Sociobot link.
- Audio and take metadata persisted in IndexedDB. License and verification verdict persisted in localStorage as documented.
- No secret-like values were found in the submitted source/configuration.
- License tokens are stripped from the page URL while preserving unrelated query parameters.
- Response headers present: HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and `X-DNS-Prefetch-Control: off`.
- Response policy observations: no Content-Security-Policy, Permissions-Policy, frame restriction (`frame-ancestors`/`X-Frame-Options`), COOP, or CORP headers. No exploit was demonstrated, so these are hardening gaps rather than separate release blockers.

## Accessibility, keyboard, responsive behavior, and motion

- Axe via Playwright found **0 serious/critical violations** and, in these scans, 0 violations of any impact on the desktop empty state, desktop populated board, populated 390px board, license dialog, privacy page, and terms page.
- Semantic checks passed: `lang="en"`, descriptive title, one `<h1>`, `<main>`, labeled controls, meaningful hero alt text, waveform text alternatives, and legal landmarks.
- Keyboard skip link was first in tab order and had a 3px visible focus outline. Main workflow controls were reachable and Enter-operable.
- Keyboard focus is not preserved after reference/flag mutations: after Enter on “Set reference,” `document.activeElement` became `<body>`. See LTM-03.
- At 390px, document/body width was exactly 390px with no horizontal page overflow. The board stacks into usable cards. Automated measurement found three direct controls below 44 CSS px in one dimension: home link 42×44, checkbox 22×44 (inside a larger label), and Terms link 38.3×44. See LTM-07.
- Under `prefers-reduced-motion: reduce`, measured animation and transition durations were `0.00001s`; no looping/flashing motion was present.

## PWA and offline

- Manifest has name/short name, standalone display, versioned start URL, product theme/background colors, 192px and 512px icons, and a maskable declaration. Chromium `Page.getAppManifest` returned no errors on live.
- Service worker installed, controlled the page, precached the shell and legal pages, and retained populated IndexedDB state through an offline reload.
- A real service-worker replacement was simulated by serving the unchanged candidate `dist/` while changing only the test response suffix for `sw.js`; `registration.update()` installed it and the in-app “Update ready. Reload to use it.” toast appeared. `skipWaiting`, client claim, and the `line-take-match-v1` cache were confirmed.
- The live manifest is served as `application/octet-stream`, although Chromium parsed it without error. Prefer `application/manifest+json`.

## Performance and delivery

Fresh Lighthouse mobile run against the live URL at 2026-08-28T05:42:53Z:

| Metric | Result | Budget |
|---|---:|---:|
| Performance | 99 | ≥90 |
| Accessibility | 100 | ≥95 |
| Best Practices | 100 | — |
| SEO | 100 | — |
| FCP | 1.0 s | — |
| LCP | 1.2 s | <2.5 s |
| TBT | 116 ms | proxy for responsiveness |
| CLS | 0 | <0.1 |
| Total transfer | 52 KiB | — |

Build payloads are 22.60 KB app JS + 0.77 KB preload helper JS, 15.79 KB app CSS + 0.79 KB legal CSS, no font files, and 24.83 KB hero WebP. All stated bundle budgets pass. Lighthouse reported no console errors.

Live caching does not meet the attached immutable-asset policy: HTML, hashed JS/CSS, images, manifest, and service worker all receive the same `Cache-Control: public, must-revalidate, max-age=30`. Hashed assets should receive a long-lived immutable policy while HTML and `sw.js` remain short-lived. See LTM-06.

## Defects

### LTM-01 — S1 blocker — Production Studio checkout is unavailable

The candidate advertises a $19 purchase and links to `https://api.sociobot.in/api/v1/products/line-take-match/checkout`, but fresh HEAD and GET requests return HTTP 404 JSON instead of a hosted checkout redirect. Users cannot buy the advertised unlock. Register/enable the production product and verify the return URL before release.

### LTM-02 — S1 blocker — Network failure accepts a never-verified license token

Reproduction: clear license storage, open “Unlock studio,” paste a new arbitrary token, make the Sociobot verify request fail, and submit. The UI changes to “Studio unlocked,” enabling unlimited takes and backups. `verifyLicense()` returns `cached?.valid ?? true`; because `saveLicense()` removed the verdict, an unknown token defaults to valid. Offline optimism must require a previously cached valid verdict for that token. A new/unverified token must remain locked when verification cannot complete.

### LTM-03 — S2 major — Keyboard actions lose focus after board mutations

Tab to “Set reference” and press Enter. The reference is set, but the full-app re-render removes the focused node and leaves focus on `<body>`. Flagging and line selection use the same re-render pattern. A keyboard user working through many takes must restart navigation after each action. Restore focus to the equivalent updated control or use focused incremental DOM updates.

### LTM-04 — S2 major — Invalid-license error appears off-screen outside its modal

With the unlock dialog open, paste a token for which verification returns `valid:false`. The app re-renders the error in the import panel at y=1156 while the viewport is 800px high and reopens the modal at y=41–759. The dialog shows the blank restore form but no error, leaving the user without visible in-context recovery feedback. Render and announce the error inside the dialog and keep the entered value or a clear retry state.

### LTM-05 — S3 minor — Mixed import overstates successful processing

Selecting one valid and one corrupt WAV adds only the valid take and shows the decode error, but the toast says “2 files processed locally.” Report success/failure counts separately so users do not mistake a failed take for an imported one.

### LTM-06 — S3 minor — Hashed assets lack long-lived immutable caching

The live host serves even content-hashed JS/CSS and the hero image with `max-age=30, must-revalidate`. This violates the delivery policy and causes unnecessary revalidation. Configure long-lived immutable caching for hashed assets; keep HTML, manifest as appropriate, and `sw.js` update-friendly.

### LTM-07 — S3 minor — Several mobile targets miss the 44×44 product target

At 390px, the visible home link measured 42×44 and the Terms link 38.3×44; the checkbox itself measured 22×44 but is wrapped by a larger label. Increase the direct link hit areas to at least 44×44 and retain the checkbox label hit area.

## Acceptance decision

**FAIL.** Do not promote this candidate as complete. LTM-01 and LTM-02 are release blockers. Re-test the full paid flow, including a real hosted checkout return, valid/revoked/invalid/wrong-product licenses, first-use offline behavior, and cached-valid offline behavior after fixes. The free local-first PWA can be considered functionally healthy, but that does not satisfy the complete paid product contract.
