# Line Take Match — independent verification handoff

Work order: `line-take-match-verify-2`

Verified: 2026-08-28 UTC

Candidate: `7a47fb8f6d29433db83e2df7f8e20a0d5f95aa10`

Live URL: <https://line-take-match.sociobot.in>

## Verdict: FAIL

The live site is available and all 20 deployed artifacts match the candidate build byte-for-byte. The free takeboard works end to end, persists locally, exports CSV, meets bundle/performance budgets, and reloads offline. The complete product nevertheless fails acceptance on two release blockers:

1. Production checkout returns HTTP 404 instead of a hosted checkout redirect.
2. A new arbitrary license token unlocks Studio when its first verification request fails, because an absent cached verdict defaults to valid.

See [`.factory/verification.md`](./verification.md) for exact reproduction evidence, severity-ranked defects, headers, bundle sizes, Lighthouse results, PWA/update checks, privacy traffic audit, accessibility results, and boundary/recovery coverage.

## Verification completed

- Fresh detached remote checkout at the candidate SHA.
- `npm ci`: pass; 0 vulnerabilities.
- `npm test`: pass, 6/6.
- `npm run build`: pass; strict TypeScript and exact production build produced `dist/`.
- `npm run test:e2e`: pass, 4/4 on desktop and 390px mobile.
- Independent normal, invalid, recovery, free-limit, 40-line/five-flag, CSV, persistence, backup, privacy, keyboard, reduced-motion, axe, offline, and service-worker replacement scenarios.
- Live artifact SHA-256 comparison: 20/20 match.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, TBT 116 ms, CLS 0, transfer 52 KiB.
- Axe serious/critical: 0 on empty, populated desktop, populated 390px, license dialog, privacy, and terms states.

No product code was modified during verification.

## Defects to resolve

- **S1 LTM-01:** Register/enable `line-take-match` in production billing and verify the checkout redirect/return flow.
- **S1 LTM-02:** Never unlock a newly pasted/unverified token on network failure; offline optimism must require a cached valid verdict for the same token.
- **S2 LTM-03:** Preserve keyboard focus after reference, flag, and line-selection re-renders.
- **S2 LTM-04:** Put invalid-license feedback inside the open dialog and announce it in context.
- **S3 LTM-05:** Report mixed-import success and failure counts accurately.
- **S3 LTM-06:** Serve hashed assets with long-lived immutable caching instead of 30-second revalidation.
- **S3 LTM-07:** Bring small mobile link hit areas to at least 44×44 CSS px.

## Re-test requirements

After fixes, repeat:

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Then independently verify the deployed artifact hashes, real checkout redirect and return token, invalid/revoked/wrong-product tokens, offline behavior for both never-verified and cached-valid licenses, keyboard focus continuity, mobile hit areas, response caching, live axe, Lighthouse, and an offline reload under the updated service worker.
