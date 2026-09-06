# Line Take Match — repair 3 handoff

## Outcome

**PASS.** Review 6 finding F-6-1 is fixed, and no known product finding remains.

- Implementation SHA: `44803891c20dd53276d0babd6ad432777e3fc1cc`
- Verification evidence SHA: `5169d46349b240e1a062c59da41d6010a0513b8c`
- Live URL: <https://line-take-match.sociobot.in>
- Static deployment: `77267265-585c-4de1-aa30-3fb1a18229b1`
- Deployed host: `ambitious-mushroom-0643cb00f.7.azurestaticapps.net`

The later handoff and verification commit does not change the deployed product
image. The implementation SHA above is the release candidate.

## What changed

- Replaced **“The stall is offline.”** with **“You’re offline.”**
- Replaced **“Try the takeboard again”** with **“Try again.”**
- Rewrote the supporting text as direct connection and recovery steps.
- Added a 44 px retry target, visible keyboard focus, and reduced-motion rules.
- Bumped the service-worker cache to `line-take-match-v3`, so installed copies
  receive the corrected fallback.
- Added a browser regression that opens the recovery page and follows its retry
  action back to the working app. The public-route accessibility scan now also
  covers `/offline.html`.
- Expanded the live verifier to check the fallback and fresh 390×844 phone and
  1440×960 desktop contexts.

The paid offer remains $19 once. Studio still adds unlimited takes and portable
audio backups. Checkout remains on the Sociobot billing route.

## Product check

Before scrolling, fresh phone and desktop visits state the job, audience, and
first action:

- Job: compare recorded voice takes with an approved take.
- Audience: indie animators and game creators checking character lines.
- First action: **Try it with sample data**.

The sample opens three realistic takes, one approved take, a measured
difference, and comparison playback. Its persistent label, reset, exit cleanup,
offline reload, and separation from the real take list all passed. The live
sentinel check ran only inside a disposable fresh browser context.

## Verification

From `npm ci` in a clean detached checkout at verification SHA `5169d46`
(whose product artifact is the implementation SHA above):

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 60 packages, 0 vulnerabilities |
| `npm test` | PASS; 13/13 |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; `dist/` produced |
| Every exact command in `.factory/claims.json` | PASS; 17/17 individually |
| `npm run test:claims` | PASS; 17/17 |
| `npm run test:e2e -- --workers=1` | PASS; 64/64 desktop and phone tests |
| `npm run verify:live` | PASS at 2026-09-06T06:52:14Z; phone, desktop, demo, offline, routes, checkout, and axe |
| `verify-url.sh` on root and `/offline.html` | PASS; no console errors |
| Public artifact comparison | PASS; 29/29 byte-for-byte |
| Live mobile Lighthouse | 100 performance, 100 accessibility, 100 best practices, 100 SEO |

Lighthouse measured FCP 0.9 s, LCP 1.2 s, TBT 60 ms, CLS 0, and 57 KiB total.
The build emits 11.53 KiB gzip app JavaScript and 5.25 KiB gzip app CSS.

Live evidence is under `/work/.evidence/repair-3/`. The catalog description was
copied to `/work/.evidence/catalog-description.txt` and is 67 characters
without its final newline.

## Earlier findings

The full committed review, verification, and polish history was re-read.
F-1-1 through F-5-2 and LTM-01 through LTM-08 remain closed by the existing
claim and browser suites. F-6-1 is now closed by direct live recovery copy and
the new outcome test.

The work-order path
`factory-evidence/line-take-match-review-6/qa-report.md` was not mounted in this
worker. The complete committed `.factory/review-6.md` was used, and its single
finding was reproduced before repair.

## How to verify

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:claims
npm run test:e2e -- --workers=1
npm run verify:live
```

Open <https://line-take-match.sociobot.in/offline.html> to check the repaired
recovery page. Open <https://line-take-match.sociobot.in/?demo=1> for the
isolated sample.

## Known gaps and next steps

No known product gaps remain. This is a static local-first PWA, so backend
tenant isolation, server restart persistence, health, and 429 checks do not
apply. No further product change is required for Review 6.
