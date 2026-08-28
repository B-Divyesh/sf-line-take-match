# Line Take Match review 2 handoff

## Outcome

Adversarial first-read review 2 is complete. The verdict is **FAIL**. No product code was changed.

The live first screen is clear, the one-click demo is realistic and isolated, checkout works, routes and metadata are complete, and all automated commands pass. Acceptance remains blocked because several claim tests prove only part of their registered sentences. Additional public claims are unlisted. Route navigation does not move focus to or announce the new h1. The review also records a missing approved-versus-candidate playback action and two copy issues.

Full evidence, exact copy counts, prior-finding status, and fixes are in `.factory/review-2.md`.

## Verification performed

Clean clone `/tmp/ltm-review2.541MpO` at `fd313285bcd56174a9dece787869473578315fd3`:

- `npm ci`: passed; 0 vulnerabilities.
- All ten `.factory/claims.json` commands: passed individually.
- `npm test`: 13/13 passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 40/40 passed.

Live site:

- Fresh Chromium at 390×844 and 1280×800.
- Demo entry, populated sample state, reset, real-storage sentinel isolation, exit cleanup, browser Back, and offline reload checked.
- `npm run verify:live` passed.
- All links across root, demo, Privacy, Terms, and 404 were crawled; no dead link was found.
- Checkout returned 303 to hosted Dodo checkout; the public catalog reports USD 1900.
- Axe found zero violations at both widths on root, demo, Privacy, Terms, and an unknown-path 404.
- Titles, h1/main counts, descriptions, canonicals, OG/Twitter metadata, icons, social-image dimensions, robots, sitemap, response status, and security headers were checked.

## Remaining work

See F-2-1 through F-2-6 in `.factory/review-2.md`. F-2-1 reopens the earlier F-1-4 claim-coverage finding and is blocking.

## Re-run

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run verify:live
```
