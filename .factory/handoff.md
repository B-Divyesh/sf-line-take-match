# Line Take Match handoff

## Outcome

Polish round 1 is complete and deployed at <https://line-take-match.sociobot.in>. Every finding in `.factory/review-1.md` and both earlier verification reports is closed. The product remains a static, local-first PWA with its neon voice-booth identity.

## Delivered

- A plain first screen that states the comparison job, names indie animators and game creators, and exposes demo and import actions at 390×844.
- An isolated one-click demo at `/?demo=1` and `/demo/` with three realistic synthesized dialogue takes, an approved take, differences, notes, and a review flag.
- Persistent demo controls for reset and exit. Demo changes use `demo:line-take-match`; real work uses `line-take-match`.
- A ten-entry claim registry with observable Playwright checks for every published capability.
- Real route documents for demo, privacy, terms, and 404, with route-specific titles and complete metadata.
- Shared navigation, legal links, footer provenance/build ID, focusable main landmarks, visible skip behavior, and a designed 404 response.
- A registered $19 production Studio product through the Sociobot billing API. Checkout now redirects to the hosted Dodo session.
- Production manifest MIME mapping, PWA cache update behavior, one-year immutable asset caching, and offline demo reload.
- Updated catalog description, README, copy audit, demo documentation, visual-system wording, and social/Apple assets derived from the original product artwork.

## Exact verification

Clean clone `/tmp/line-take-match-final.hujZkx` at `4fc4a4e52c1bce5e5488c06e8c6bd7b07142d553`:

- `npm ci`: passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed and produced `dist/index.html` plus demo, privacy, terms, and 404 entry points.
- `npm run test:claims`: 9/9 flows passed for all ten claim IDs.
- Every claim command from `.factory/claims.json` was also run separately from a clean clone; all ten passed.
- `npm run test:e2e`: 40/40 passed across desktop Chromium and 390×844 mobile Chromium.
- Axe in the browser suite: no serious or critical violations on root, demo, privacy, terms, or 404.
- Browser suite: no unexpected console errors and no 390 px horizontal overflow.

Production output:

- App JavaScript: 28.89 KB raw / 10.85 KB gzip.
- App CSS: 18.14 KB raw / 4.99 KB gzip.
- Social preview: 68,094 bytes. Apple icon: 13,139 bytes.
- No external fonts, scripts, analytics, trackers, or audio-service calls.

Performance:

- Local Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, TBT 130 ms, CLS 0.
- Live Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, TBT 130 ms, CLS 0.
- Reports: `.factory/evidence/lighthouse-local.json` and `.factory/evidence/live/lighthouse.json`.

Live verification after deployment:

- Deployment ID: `e512d74d-ff81-4d06-b769-89d1c97a2226`.
- `verify-url.sh` passed on `/`, `/?demo=1`, `/privacy/`, and `/terms/` with no console errors.
- `/not-a-real-page` returns the designed page with HTTP 404.
- `npm run verify:live` passed demo seeding, real-data isolation, reset, exit cleanup, offline reload, mobile CTA placement, skip focus, route metadata, axe, checkout, license rejection, and manifest MIME checks.
- SHA-256 checks matched the deployed root, demo, privacy, terms, 404, manifest, and service worker to the local `dist/` files.
- The checkout endpoint returns HTTP 303 to `https://checkout.dodopayments.com/session/...`.
- The production catalog reports `line-take-match`, USD 1900, and the correct product URL.
- The public verification endpoint rejects an invalid token with HTTP 200 and `reason: "invalid"`.
- Recorded tests cover checkout-return capture, verified unlock, wrong/invalid/revoked lockout, first-use offline lockout, and cached-valid offline access without making a real purchase.
- Evidence summary: `.factory/evidence/live/live-check.json`; screenshots are under `.factory/evidence/live/`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run verify:live
```

Deploy with:

```sh
/opt/fleet/lib/deploy-static.sh line-take-match /work/repo/dist
```

## Product boundaries

- The app compares measurable audio cues. It does not transcribe, generate, identify, judge, or clone voices.
- Import support depends on formats the browser can decode; WAV is the safest option.
- Users should keep source recordings. Browser storage can be cleared by the browser or device owner.
- No real charge or refund was created during verification. Paid return, valid, revoked, and cached behavior use recorded deterministic responses; the live hosted checkout and invalid response were verified directly.

## Remaining work

None for this work order.
