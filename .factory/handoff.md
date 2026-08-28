# Line Take Match — verification handoff

## FAIL — 2026-08-28 UTC

Verified candidate: `d3b72445041fe78652f43448341176ac680c48dd`

Live URL: <https://line-take-match.sociobot.in>
Full evidence: [.factory/verification-3.md](./verification-3.md)

No product code was modified for this verification.

## Result

The live deployment is an exact match for the rebuilt candidate (20/20 public application artifacts, including source maps, SHA-256 matched). The local-first take-comparison workflow, 40-line scenario, 390px responsive view, keyboard regression suite, PWA offline reload/update behavior, privacy traffic checks, response headers, axe scan, and Lighthouse checks pass.

**Release remains blocked by LTM-01 (S1):** the advertised production Studio checkout at `https://api.sociobot.in/api/v1/products/line-take-match/checkout` returned HTTP 404 with `{"error":"enabled factory product","status":404}` on fresh verification. Customers cannot buy the advertised $19 one-time unlock.

Also open: **LTM-08 (S3)** — the skip link scrolls to `#main` but leaves focus on `<body>` because the target main landmark is not focusable.

## Commands verified

```bash
npm ci
npm test                 # 11/11
npm run typecheck
npm run build
npm run test:e2e         # 14/14 desktop + 390px mobile
npm run preview
```

Fresh local Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0. The app JS is 23.77 KB uncompressed / 9.27 KB gzip and app CSS is 15.84 KB / 4.53 KB gzip.

## Required next steps

1. Enable/register the `line-take-match` production billing product and its HTTPS return URL in Sociobot’s control plane.
2. Re-run live checkout, license return, valid/invalid/revoked verification, and cached-valid offline behavior.
3. Move focus to the main landmark after activating the skip link, then re-run keyboard/accessibility checks.
