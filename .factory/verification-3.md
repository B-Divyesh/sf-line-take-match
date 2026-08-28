# Independent product verification — Line Take Match

## Verdict: FAIL

Tested on 2026-08-28 UTC against commit `d3b72445041fe78652f43448341176ac680c48dd` and <https://line-take-match.sociobot.in>. The deployed public build exactly matches this candidate and the free local-first PWA is healthy. The advertised paid Studio purchase is nevertheless not releasable: its production checkout endpoint returns HTTP 404 instead of a hosted checkout redirect. This is fresh evidence, not reliance on the previous report.

No product code was changed during verification. This report and the handoff are the only repository changes.

## Method and environment

- Fresh detached clone from the supplied repository at exactly `d3b72445041fe78652f43448341176ac680c48dd`; clean before and after product testing.
- Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2` Chromium, Lighthouse `12.8.2`.
- Exact production build was served with Vite preview. Browser verification used desktop 1280×800 and mobile 390×844 Chromium, plus the public HTTPS deployment.

## Repository quality gates

| Gate | Result | Evidence |
|---|---:|---|
| `npm ci` | PASS | 60 packages installed from the committed lockfile; npm audit reported 0 vulnerabilities. |
| `npm test` | PASS | Vitest: 3 files, 11/11 tests. |
| `npm run typecheck` | PASS | Strict `tsc --noEmit` completed without errors. |
| `npm run build` | PASS | Exact `tsc && vite build && node scripts/inject-sw.mjs`; generated `dist/`. |
| `npm run test:e2e` | PASS | 14/14 Playwright tests across desktop and 390px mobile in 31.9 s. |
| Lint | N/A | No lint script or configuration exists. |

The production build contains 23.77 KB app JS (9,274 bytes gzip), 15.84 KB app CSS (4,528 bytes gzip), no font payload, and a 24.83 KB hero WebP. The static JS/CSS/image budgets pass.

## End-to-end evidence

- A fresh desktop run, using generated PCM WAV fixtures and a mocked **valid** verification response only to exercise the client-side Studio entitlement, imported 40 distinct lines in 3.960 s. It selected approved references, flagged five lines, added a handoff note, exported a 41-row CSV, and retained the board through reload. The CSV safely prefixes a formula-like note with an apostrophe.
- A real free-mode run confirmed consent is required; 12 takes import normally; the thirteenth is rejected with an explanatory message and unlock dialog. The supplied browser suite additionally passes corrupt-WAV recovery, mixed valid/corrupt counts, search/no-results recovery, remove/undo, backup rejection/import, and license error recovery.
- Live free-mode browser traffic for import, analysis, persistence, playback, and offline reload contained GET requests only, no request body/upload, and no cross-origin request (apart from `blob:` playback URLs). No console warning/error or page error occurred.
- The first keyboard Tab reaches a visible 3px cyan skip-link focus ring. Reference, flag, and line actions retain focus in the browser regression. See LTM-08 for the skip destination limitation.
- At 390px there was no horizontal overflow (390px document/client width), home and legal links measured at least 44×44 CSS px, and the board stacks into cards.
- Under `prefers-reduced-motion: reduce`, measured transition and animation duration is `0.00001s` and scroll behavior is `auto`.

## Accessibility and performance

- Axe via Playwright found **0 violations**, including 0 serious/critical, on the live root, populated board, privacy page, and terms page at mobile size.
- Root, privacy, and terms each have `lang="en"`, a descriptive title, one `<h1>`, and one `<main>`.
- Fresh local mobile Lighthouse: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.5 s, TBT 60 ms, CLS 0, 54 KiB total transfer.

## PWA and local-first checks

- The live manifest parsed with zero Chromium manifest errors. It contains standalone display, versioned start URL, theme/background colors, 192px/512px icons, and a maskable icon declaration.
- On the live site, a service worker controlled the page after reload; a populated local board remained visible after setting the browser offline and reloading.
- A separate production-output harness served the exact candidate app and changed only the test response bytes of `sw.js`. `registration.update()` fetched the new worker twice in total and displayed the in-app “Update ready. Reload to use it.” toast. This verifies the candidate update path without altering submitted product files.

## Deployment identity, privacy, and response policy

- SHA-256 comparison downloaded every 20 public candidate artifacts from the live paths, including source maps: **20/20 exact matches, 0 mismatches**. Azure deployment metadata is intentionally not a public artifact.
- Live root and assets have HSTS, `nosniff`, strict referrer policy, CSP, `X-Frame-Options: DENY`, Permissions-Policy, COOP, and CORP. Hashed `/assets/*` responses are one-year immutable; `/sw.js` is `no-cache`.
- The host still returns `application/octet-stream` for `manifest.webmanifest` despite the configured manifest MIME type. Chromium reports no manifest parse issue; this is a deployment hardening observation, not a release blocker.
- Source/build review and live request capture found no analytics, ads, fingerprinting, CDN fonts/scripts, transcription, generation, or audio upload. Audio/takes use IndexedDB; licenses/verdicts use localStorage. The only coded runtime API is Sociobot license verification.
- The verify endpoint returns valid CORS for the production origin and an invalid token returns HTTP 200, `Cache-Control: no-store`, and `{"valid":false,"reason":"invalid"}`.

## Defects

### LTM-01 — S1 blocker — Production Studio checkout is unavailable

At 2026-08-28T06:39Z, fresh `GET https://api.sociobot.in/api/v1/products/line-take-match/checkout` returned HTTP **404** with `{"error":"enabled factory product","status":404}`. The app advertises “Buy Studio — $19 once” and points to this URL, so a customer cannot purchase the offered unlock or complete a real checkout-return flow. Register/enable the production Sociobot product with the intended return URL, then verify hosted checkout and a returned valid/revoked license on the live site.

### LTM-08 — S3 minor — Skip link does not transfer keyboard focus to main content

The visible “Skip to takeboard” link changes the URL to `#main`, but `<main id="main">` has no `tabindex`; after Enter, `document.activeElement` is `<body>`, not `<main>`. The link therefore scrolls but does not establish a predictable keyboard/screen-reader reading position. Make the main landmark focusable (typically `tabindex="-1"`) and focus it on skip activation.

## Acceptance decision

**FAIL — do not promote as a complete product.** The free, local-first comparison product satisfies the tested workflow, privacy, PWA, mobile, accessibility, and performance checks. The unavailable production checkout violates the stated one-time paid-feature contract and is a release blocker. Re-test checkout registration and return-token verification after the external billing control-plane repair; also address LTM-08.
