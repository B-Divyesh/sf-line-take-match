# Line Take Match — review 5 handoff

## Outcome

**FAIL.** Independent review 5 found two issues. Product code was not changed.

- Major: the Privacy claim “You can remove takes, site data, or your local
  license” has no entry or tagged test in `.factory/claims.json`.
- Minor: the 404 page uses recording metaphors instead of direct recovery
  text.

The full evidence is in `.factory/review-5.md`.

## Versions reviewed

- Implementation candidate:
  `ea8432eedf027124bb5d63d2c1d557859973f808`
- Documentation baseline:
  `1fcf957d6663ddb50c0c77ddd476af92d5aa7e74`
- Live URL: <https://line-take-match.sociobot.in>
- Live comparison: 29/29 public build artifacts matched, with no mismatches.

## Verification completed

- Fresh phone and desktop live contexts confirmed the job, audience, first
  action, populated sample, persistent banner, reset, and real-data isolation.
- Every exact command in `.factory/claims.json` passed individually from a
  fresh clone. The aggregate claim run passed 16/16.
- `npm test` passed 13/13. `npm run build` produced `dist/`.
- `npm run test:e2e -- --workers=1` passed 60/60.
- `npm run verify:live` and `/opt/fleet/lib/verify-url.sh` passed.
- Live Lighthouse scored 100 in Performance, Accessibility, Best Practices,
  and SEO. LCP was 1.2 s, TBT 70 ms, and CLS 0.
- Offline reload, service-worker update notice, reduced motion, keyboard and
  dialog focus, legal routes, links, expected 404 status, checkout redirect,
  invalid licenses, and privacy traffic were checked.

## Run again

```bash
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e -- --workers=1
npm run verify:live
```

Also run every `test` value in `.factory/claims.json` separately.

## Required next work

1. Register and test the Privacy removal promise, or remove that sentence.
2. Replace the 404 metaphor with “Page not found” and a direct explanation.
3. Rerun all claim, browser, live, accessibility, and artifact checks.

Evidence copies are under `/work/.evidence/review-5/`. The factory summary is
`/work/.evidence/qa-report.md`; the machine result is
`/work/.evidence/qa-result.json`.
