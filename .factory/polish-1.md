# Polish round 1 — finding closure

Reviewed sources: `.factory/review-1.md`, `.factory/verification.md`, and `.factory/verification-3.md`. No earlier `.factory/polish-*.md` file existed.

## Adversarial review findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the metaphor headline with “Compare voice takes with an approved take.” The first 390×844 viewport now names indie animators and game creators, shows demo and import actions, explains the demo, and lists privacy, offline, and price facts. | Playwright: `states the job, audience, next step, and demo action in the first mobile viewport`; screenshots: `.factory/evidence/landing-mobile.png`, `.factory/evidence/live/root/screenshot-mobile.png`; cold live check: `/` in `.factory/evidence/live/live-check.json`. |
| F-1-2 | Added one-click `/?demo=1` and `/demo/` entry points with three usable audio takes, one approved take, measured differences, notes, and a flag. Demo state uses only `demo:line-take-match`; reset reseeds it and “Start for real” clears it. A persistent banner explains the sandbox. | Claim: `@claim:demo-sandbox`; live verifier preserves a sentinel in `line-take-match`, resets the demo, clears demo rows on exit, and reloads the three takes offline. Screenshots: `.factory/evidence/demo-mobile.png`, `.factory/evidence/demo-desktop.png`, `.factory/evidence/live/demo/screenshot-mobile.png`. Live: <https://line-take-match.sociobot.in/?demo=1>. |
| F-1-3 / LTM-01 | Registered and enabled the production Sociobot product for `line-take-match`, $19 USD once, with the production return URL. The product still uses only Sociobot billing routes. Added revoked-license regression coverage. | Live checkout returned HTTP 303 to `checkout.dodopayments.com`; live catalog reports `price_minor: 1900`; live invalid token returned `valid:false, reason:"invalid"`. `verify:live` checks both. Tests: `@claim:billing-api`, `@claim:studio-backup`, `captures a verified checkout return token…`, and all four `src/license.test.ts` cases, including cached-valid offline, never-verified offline, invalid, and revoked. |
| F-1-4 | Added `.factory/claims.json` with ten claims and one tagged test per claim. Tests assert outcomes for isolation, privacy, voice-service boundaries, offline reload, grouping, comparison cues, CSV contents, the free boundary, Studio backup audio, and billing routes. | A clean clone ran `npm run test:claims` with 9/9 flows passing. Every registry command was also run separately; all ten `@claim:*` selectors passed. Source: `tests/claims.spec.ts`. |
| F-1-5 | Added real `/demo/`, `/privacy/`, `/terms/`, and `/404/` documents; unknown paths return the designed 404 with status 404. Every route has its own title, description, canonical URL, Open Graph/Twitter metadata, Apple icon, one h1, shared header/footer, legal links, build ID, and skip link. Added demo sitemap entry and a 1200×630 product-art social image. | Playwright: `serves route-specific metadata and the designed not-found page`; unit: `configures unknown paths as a real 404`; screenshots: `.factory/evidence/not-found.png`; live route/status/title/axe checks in `.factory/evidence/live/live-check.json`. |
| F-1-6 / LTM-08 | Made every main landmark programmatically focusable and explicitly moves focus there when the skip link is activated. | Playwright: `moves focus to main content from the skip link`; cold live verifier asserts `document.activeElement.id === "main"`. |
| F-1-7 | Standardized the product nouns to “take list,” “take,” and “approved take.” Replaced “Drop in a session” and “Your cue sheet is quiet” with literal task headings. | `.factory/copy-audit.md`; Playwright first-screen and workflow assertions; cold live screenshots. |
| F-1-8 | Rewrote the README into short plain sentences, split free and paid boundaries, and confined necessary technical terms to developer instructions. | `.factory/copy-audit.md` records a 22-word maximum with no banned marketing words; README longest prose sentence is 17 words. |

## Earlier verification regressions

| Finding | Status and evidence |
| --- | --- |
| LTM-02 | Kept fixed. A new token cannot unlock during a network failure; only the same token with a cached valid verdict works offline. `src/license.test.ts` covers both states. |
| LTM-03 | Kept fixed. Reference, flag, and line controls regain equivalent focus after rendering. Playwright: `keeps keyboard focus on the updated reference, flag, and line controls`. |
| LTM-04 | Kept fixed. Invalid-license feedback stays inside the reopened dialog, is announced, and preserves the pasted value. Playwright: `keeps an unverified license locked and explains an invalid token inside the dialog`. |
| LTM-05 | Kept fixed. Mixed imports report successful and failed counts separately. Playwright: `reports mixed import results without overstating the successful takes`. |
| LTM-06 | Kept fixed. `/assets/*` uses one-year immutable caching while HTML and `sw.js` remain update-friendly. Unit: `keeps hashed assets immutable and the service worker update-friendly`. |
| LTM-07 | Kept fixed. Home, footer, dialog, and mobile controls meet the 44 px target. Playwright: `provides 44px home and legal link targets`; full route scan reports no mobile overflow. |
| Verification-3 manifest observation | Added the Azure `mimeTypes` map. The deployed manifest now returns `application/manifest+json`; `verify:live` asserts it. |

## Release evidence

- Clean clone at `4fc4a4e52c1bce5e5488c06e8c6bd7b07142d553`: `npm ci`, audit, 13/13 unit tests, build, 9/9 aggregate claim flows, and 40/40 desktop/mobile browser tests passed.
- Individual clean-clone claim commands: all ten entries in `.factory/claims.json` passed independently.
- Local Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.2 s, CLS 0.
- Live Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.1 s, CLS 0.
- Live `verify-url.sh`: root, demo, privacy, and terms returned 200 with one h1, a main landmark, named controls, alt text, correct titles, and no console errors.
- Live cold verifier: demo isolation/reset/exit/offline, mobile first screen, focus, route titles, 404 status, axe, checkout redirect, invalid license, and manifest MIME all passed.
- SHA-256 checks matched the deployed root, demo, privacy, terms, 404, manifest, and service worker to `dist/`.
- Deployment: Azure Static Web Apps production deployment `e512d74d-ff81-4d06-b769-89d1c97a2226` at <https://line-take-match.sociobot.in>.

All findings from the current and earlier reports are closed.
