# Line Take Match — repair handoff

Work order: `line-take-match-repair-1`
Base verifier report: `13c82bfde7681f6850936ebd1930696110034bb5`
Repaired candidate base: `7a47fb8f6d29433db83e2df7f8e20a0d5f95aa10`

## Repairs

- **LTM-02:** License verdicts now bind to the exact token. A new pasted or URL-returned token remains locked if verification is unavailable; only a previously verified valid verdict for that same token permits offline Studio use.
- **LTM-03:** Reference, flag, and line controls carry stable focus keys and regain keyboard focus after the board re-renders.
- **LTM-04:** Restore failures render inside the open dialog as an assertive, associated message. The entered token remains available for correction or retry.
- **LTM-05:** Mixed imports report separate successful and failed counts while retaining per-file decode errors.
- **LTM-06:** `public/staticwebapp.config.json` sets immutable one-year caching for `/assets/*`, keeps `sw.js` updateable with `no-cache`, and adds CSP, frame, permissions, COOP/CORP, nosniff, and referrer policies. The generated precache excludes Azure’s non-public deployment metadata so the worker can install. Azure still overrides the manifest response to `application/octet-stream`; Chromium parses it, but the desired `application/manifest+json` declaration is present in the host configuration.
- **LTM-07:** Home and legal links have direct 44×44 CSS-pixel targets in both app and legal styles.
- The checkout link, product slug, $19 one-time terms, return-token capture, and all free local-first workflow behavior were retained. Production billing registration is external to this repository and is checked again after deployment.

## Regression coverage

- `src/license.test.ts`: never-verified offline token stays locked; only a token-matched cached-valid verdict works offline; invalid verdict stays locked.
- `src/delivery.test.ts`: immutable assets and updateable service worker delivery policy.
- `tests/app.spec.ts`: mixed valid/corrupt import counts, keyboard focus continuity, unavailable/invalid dialog recovery, checkout return-token URL cleanup, and 44px targets, alongside the existing end-to-end PWA workflow. The suite runs in desktop Chromium and a 390×844 mobile project.

## Local verification — 2026-08-28 UTC

```text
npm ci                         PASS — 60 packages, 0 vulnerabilities
npm test                       PASS — 3 files, 11 tests
npm run typecheck              PASS — strict TypeScript
npm run build                  PASS — dist/ with root index.html
npm run test:e2e               PASS — 14 tests (desktop + 390px mobile)
```

- Production app JS: 23.77 KB uncompressed / 9.26 KB gzip; CSS: 15.84 KB / 4.51 KB gzip; hero WebP remains below the 300 KB image budget. No third-party font or script is introduced.
- Local `verify-url.sh`: title, `lang`, one `<h1>`, `<main>`, image alt text, labeled buttons, and console checks all passed; desktop load was 717 ms.
- Axe via Playwright at 390px: 0 violations/0 serious-or-critical issues and 0 console errors on `/`, `/privacy/`, and `/terms/`.
- Existing browser regression covers IndexedDB persistence through a service-worker-controlled offline reload. The updated worker remains precached and updateable; the production update/offline check is repeated after deploy.

## Live deployment verification — 2026-08-28 UTC

- Deployed `a9426ca5cd7671b2cf39072508559e88da8cea9e` using `/opt/fleet/lib/deploy-static.sh line-take-match dist` to <https://line-take-match.sociobot.in>.
- SHA-256 comparison: **20/20 public build artifacts matched** `dist/` exactly (deployment metadata is intentionally not a public artifact).
- Live mobile Chromium: service worker controlled after reload; a subsequent offline reload rendered “Hear the line. See the drift.” Axe found 0 violations (0 serious/critical) and there were 0 console/page errors.
- `verify-url.sh`: HTTP 200, title/lang/one-h1/main/alt/button checks passed; desktop live load was 997 ms.
- Live response policy: hashed `main-BTTqWMs2.js` returns `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `Cache-Control: no-cache`. CSP, `X-Frame-Options: DENY`, Permissions-Policy, COOP, CORP, nosniff, and referrer policy are present.
- The live manifest is still served by Azure as `application/octet-stream` despite the configuration declaration; Chromium reports no manifest error.

## Known external blocker

**LTM-01 remains blocked outside this repository.** At 2026-08-28 UTC, `GET https://api.sociobot.in/api/v1/products/line-take-match/checkout` still returns HTTP **404** (`{"error":"enabled factory product","status":404}`), so a real hosted checkout and return token cannot be exercised. The production catalog must register/enable `line-take-match` with its `$19` one-time price and `https://line-take-match.sociobot.in/` return URL. The client return-token behavior is covered in browser regression, but the product cannot be called releasable until the factory billing control plane enables that endpoint.
