# Line Take Match — polish round 2 handoff

## Released repair

Commit `47b9ae63c4264e5c3daec3009ac785d410dc3144` closes every finding in
`review-1.md`, `review-2.md`, `verification.md`, `verification-3.md`, and
`polish-1.md`. It is pushed to `main` and deployed as the Azure Static Web App
production build (`sf-line-take-match`, status `Ready`) at
<https://line-take-match.sociobot.in>.

The round-two changes strengthen all published claim tests, add route heading
focus plus polite announcements, add local approved-then-candidate playback,
replace vague format language, standardize the term **line**, and remove
unprovable billing/credential statements. The product remains the dark
night-market dubbing-booth PWA; no visual-system replacement was made.

## Verification evidence

Fresh clone: `/tmp/line-take-match-clean.HUFbsZ` at the released commit.

- `npm ci` — passed; 0 vulnerabilities.
- `npm test` — 13/13 passed.
- `npm run build` — passed; generated `dist/index.html`.
- `npm run test:claims` — 16/16 passed. This executes every registry selector
  in `.factory/claims.json`; the first two listed selector commands were also
  run independently from the clean clone.
- `npm run test:e2e -- --workers=1` — 58/58 passed, including desktop and
  390×844 mobile, axe, privacy, offline, keyboard, route focus, and A/B
  playback coverage.
- `npm run verify:live` — passed at 2026-08-28T13:17:29Z. It cold-checked root,
  demo, Privacy, Terms, and a 404; found zero serious/critical axe violations
  and zero console errors; confirmed the demo sentinel isolation/reset/exit,
  offline reload, 303 hosted checkout redirect, invalid-license rejection,
  manifest MIME type, route focus announcement, and two playback actions.
- Live Lighthouse mobile: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; LCP 2.299 s and CLS 0. Report:
  `.factory/evidence/lighthouse-live.json`.

Evidence screenshots:

- `.factory/evidence/live/cold-mobile.png`
- `.factory/evidence/live/demo-polish-2-mobile.png`
- `.factory/evidence/live/demo-polish-2-desktop.png`
- `.factory/evidence/live/live-check.json`

The built initial application JavaScript is 30.67 KB (11.35 KB gzip) and CSS
is 18.20 KB (5.01 KB gzip), below the static-product budgets.

## Run or deploy

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run verify:live
```

Deploy `dist/` with `/opt/fleet/lib/deploy-static.sh line-take-match dist`.

## Known gaps

None. The app intentionally does not generate, transcribe, or clone voices;
it compares creator-owned recordings locally.
