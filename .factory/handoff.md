# Line Take Match — polish round 3 handoff

## Outcome

All cumulative adversarial-review findings are closed. The repaired product is
committed in `ea8432eedf027124bb5d63d2c1d557859973f808` and deployed at
<https://line-take-match.sociobot.in>.

The important round-3 repair is the demo first screen. `?demo=1` now shows an
approved take, candidate take, measured level delta, and local A/B playback
before any board tools. It keeps the existing night-market booth identity.
Portable Studio backups now restore into a clean browser via the new empty-state
**Import a project backup** action. The claim test proves the exported audio,
take count, line, note, measurement, flag, approved state, and playable audio.

## Run and verify

```bash
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e -- --workers=1
npm run verify:live
```

`npm run build` writes the static PWA to `dist/`. The work order deploys that
directory with `npm ci && npm test && npm run build`; production was uploaded
to Azure Static Web Apps using that output.

## Exact evidence

- Fresh clean clone: `/tmp/line-take-match-polish3-clean.86cTXM` at
  `ea8432eedf027124bb5d63d2c1d557859973f808`.
- `npm ci`: passed with 0 vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed; `dist/index.html` exists. Initial app JavaScript is
  31.80 KB raw / 11.53 KB gzip and CSS is 19.58 KB raw / 5.25 KB gzip.
- Every exact command in `.factory/claims.json`: 16/16 passed independently
  from the clean clone.
- `npm run test:e2e -- --workers=1`: 60/60 passed from the clean clone.
- `verify-url.sh`: local and live root, demo, Privacy, and Terms passed with
  title, `lang`, one h1, main landmark, alt text, labeled controls, and no
  console errors. Live reports are under `.factory/evidence/live/polish-3/`.
- Axe: 0 violations on root, demo, Privacy, Terms, and 404 at 390px; no mobile
  horizontal overflow.
- Offline/privacy: claim tests cover controlled offline demo reload, separate
  demo storage, reset/exit sentinel preservation, same-origin GET-only request
  capture, and no tracking resources.
- Lighthouse: local and live demo each scored Performance 100, Accessibility
  100, Best Practices 100, and SEO 100. Live FCP was 1.1s, LCP 1.2s, CLS 0.
- `npm run verify:live` passed three consecutive cold runs after deployment.
  It verified demo isolation/reset/exit/offline, route titles/statuses, 404,
  focus announcement, checkout redirect, invalid-license rejection, manifest
  MIME, serious axe checks, and zero console errors.
- Live demo cold proof: `.factory/evidence/live/demo-polish-3-mobile.png` and
  `.factory/evidence/live/demo-polish-3-desktop.png`; the proof ends at 505px
  on a 390×844 phone viewport and 344px on a 1280×800 desktop viewport.
- Deployment: Azure Static Web Apps production target
  `ambitious-mushroom-0643cb00f.7.azurestaticapps.net`; custom domain confirmed
  to serve repair asset `main-BwensW1N.js`.

## Docs and scope

- `.factory/polish-3.md` maps every current and historical finding to its fix
  and evidence.
- `.factory/claims.json` includes a tested portability promise.
- `.factory/catalog-description.txt` is a verb-first 67-character sentence.
- No AI feature was added. The brief requires consent-safe local audio review;
  remote generation or transcription would undermine that boundary.

## Known gaps

None. The product remains a local-first PWA; Studio checkout and license
verification are the only Sociobot interactions described in the policies.
