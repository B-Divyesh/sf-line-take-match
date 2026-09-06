# Line Take Match — repair 2 handoff

## Outcome

**PASS.** The two review-5 findings are closed. The local voice-take comparison
workflow, one-click isolated demo, paid Studio path, and offline PWA remain in
scope and working.

- Implementation SHA: `3c02de9b2659623f80a97e27f643a85cf337b62a`
- Documentation baseline before this handoff: `e5310616a6e11471a3cf2c4064709f748c3994bb`
- Deployed implementation: `3c02de9`; Static Web Apps deployment
  `1c8286fb-e95e-4cd2-9de6-9b12b56acd98`
- Live URL: <https://line-take-match.sociobot.in>

## What changed

1. Registered the Privacy promise “You can remove takes, site data, or your
   local license” as `data-removal` in `.factory/claims.json`.
2. Added an outcome-based `@claim:data-removal` browser flow. It removes a
   take through the real control, waits for the eight-second undo period to
   end, verifies and removes a recorded Studio license, clears browser site
   data, and proves the following reload has an empty take list.
3. Replaced the not-found recording metaphor with “Page not found” and “This
   address does not match a page.” The recovery link remains available.
4. Updated the visible build label to `v1.1.0 · repair-2`.

## Finding disposition

| Finding group | Current disposition | Current evidence |
| --- | --- | --- |
| F-5-1 / reopened F-2-2 | Fixed. The removal promise has one registered claim and one sandbox browser test. | All 17 exact claim commands passed from a clean clone, including `data-removal`. |
| F-5-2 | Fixed. The unknown-route document uses direct recovery wording and retains its HTTP 404 response. | Clean browser route test and cold HTTPS check both found “Page not found”; live `/not-a-real-page` returned 404. |
| F-1-1, F-1-2, F-1-5 to F-1-8 | Still fixed. | Fresh phone and desktop starts showed the job, audience, first action, isolated sample, routes, focus, and responsive layout. |
| F-1-3 / LTM-01 | Still fixed. | Live checkout returned 303 to hosted Sociobot checkout. |
| F-1-4 / F-2-1 | Still fixed and extended. | 17 registered outcome tests passed individually and together. |
| LTM-02 to LTM-07, LTM-08 | Still fixed. | Clean 62-test browser suite covers license states, mutation and route focus, import recovery, caching, targets, and skip focus. |
| F-2-3 to F-2-6, F-3-1 to F-3-5 | Still fixed. | Clean browser suite and live verifier cover route announcement, approved-then-candidate playback, literal controls, first demo viewport, backup portability, and stable route-focus polling. |

The product is static, so backend tenant isolation, restart persistence,
health checks, and 429/Retry-After checks do not apply.

## Verification

Fresh clone at the implementation SHA:
`/tmp/line-take-match-repair2.jF7BBC/repo`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 0 vulnerabilities. |
| `npm test` | Passed, 13/13. |
| `npm run build` | Passed; `dist/` produced. Initial JS is 11.53 KiB gzip and CSS is 5.25 KiB gzip. |
| Every `test` command in `.factory/claims.json` | Passed individually, 17/17. |
| `npm run test:claims` | Passed, 17/17. |
| `npm run test:e2e -- --workers=1` | Passed, 62/62 across desktop and 390px mobile. |
| `/opt/fleet/lib/verify-url.sh` | Passed locally and against production: title, `lang`, main landmark, image alt text, named buttons, and no console errors. |
| Live `npm run verify:live` | Passed: phone first viewport, demo isolation/reset/exit/offline, routes, expected 404, axe serious/critical scan, checkout, invalid license, manifest, and console checks. |
| Live cold phone and desktop | Both reported the job “Compare voice takes with an approved take,” the indie animator/game-creator audience, and “Try it with sample data” before scrolling. Each showed three samples, the persistent demo label, working reset, and an empty real list after exit. |
| Live artifact comparison | 29/29 public `dist/` artifacts matched byte-for-byte. `staticwebapp.config.json` is intentionally not public and returns 404. |
| Live Lighthouse mobile | Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 976 ms, LCP 1,205 ms, TBT 3 ms, CLS 0. |

The Playwright axe integration found no serious or critical issues on all public
routes in both browser sizes. The live Lighthouse command needs an explicit
preinstalled Chromium path in this container; with that environment setting it
completed successfully. This is a worker-environment detail, not a product
runtime gap.

## Evidence and operations

- Live screenshots and the Lighthouse JSON: `.factory/evidence/repair-2-live/`.
- The catalog description is verb-first, 68 bytes, and copied to
  `/work/.evidence/catalog-description.txt`.
- Static deployment reused `sf-line-take-match` and its existing production
  configuration; it did not add a backend, replicas, volumes, or external
  tracking.

## Known gaps and next steps

No known product gaps remain from the review history. Continue to add a
registered outcome test whenever copy makes a new visitor-reliance claim.
