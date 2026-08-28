# Line Take Match — first-read review handoff

## FAIL — 2026-08-28 UTC

Reviewed live <https://line-take-match.sociobot.in> and fresh clone `c52b986be26ff646eead2802f2f6026b0c1413a8`. No product code was modified. Full findings: [review-1.md](./review-1.md).

## Result

The product fails the requested adversarial first-read review. The mobile first screen uses an unexplained metaphor and has no visible first task. There is no sample demo. `?demo=1` loads the ordinary empty product and writes to normal `line-take-match` IndexedDB rather than an isolated demo namespace. The advertised Studio checkout is still HTTP 404. `.factory/claims.json` and all `@claim:` tests are absent.

The review also records missing real `/demo`/404 behavior, incomplete route metadata, unresolved skip-link focus (`LTM-08`), and copy/plain-language issues.

## Verification performed

```bash
# fresh remote clone
npm ci
npm test             # 11/11 passed
npm run build        # passed; dist/ produced
npm run test:e2e     # 14/14 passed
```

Fresh live Chromium checks covered 390px mobile, 1280px desktop, link crawl, demo URL, offline reload, IndexedDB namespace, request interception, route metadata, and axe on root/privacy/terms (zero axe violations). The live checkout endpoint returned 404.

## Required next steps

1. Implement the one-click, isolated `/demo` sandbox and its tests/docs.
2. Repair/enable the production Sociobot checkout and verify the full paid path.
3. Add the required claims registry and one fresh-demo observable test per public claim.
4. Replace metaphor/jargon-led first-screen copy with job/audience/action copy.
5. Add proper `/demo`, designed 404, metadata, shared legal route skeleton, and skip-focus behavior; then repeat this entire review.
