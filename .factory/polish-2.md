# Polish round 2 — finding closure

Sources read: `.factory/review-1.md`, `.factory/review-2.md`,
`.factory/verification.md`, `.factory/verification-3.md`, and
`.factory/polish-1.md`.

| Finding id | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the task-first headline, named audience, one-click sample action, and three facts in the first mobile viewport. | `states the job, audience, next step, and demo action in the first mobile viewport`; live cold `/`. |
| F-1-2 | Kept the separate `demo:line-take-match` board, sample data, banner, reset, exit cleanup, and offline reload. | `@claim:demo-sandbox`, `@claim:offline-reload`; live `/?demo=1`. |
| F-1-3 / LTM-01 | Kept the production Sociobot checkout route and hosted-checkout live verifier. | `@claim:billing-api`; live checkout redirect check in `npm run verify:live`. |
| F-1-4 / F-2-1 | Expanded claim assertions to cover request method/body privacy, saved line edits, every metric delta, CSV note/measurements, and recorded USD 1900 offer data. | All 16 `@claim:*` selectors in `.factory/claims.json`; `tests/claims.spec.ts`. |
| F-1-5 | Kept explicit demo/legal/404 documents, route-specific metadata, sitemap, and real 404 response. | `serves route-specific metadata and the designed not-found page`; live route scan. |
| F-1-6 / LTM-08 | Kept skip-link focus transfer to `#main`. | `moves focus to main content from the skip link`; live cold check. |
| F-1-7 | Kept literal take-list headings and consistent product nouns. | `.factory/copy-audit.md`; landing browser checks. |
| F-1-8 | Kept short README copy and updated the format recovery instruction. | `.factory/copy-audit.md`; README review. |
| LTM-02 | Kept first-use license lock and cached-valid offline behavior. | `src/license.test.ts`; invalid-license browser test. |
| LTM-03 | Kept focus restoration after reference, flag, and line mutations. | `keeps keyboard focus on the updated reference, flag, and line controls`. |
| LTM-04 | Kept invalid license feedback in the dialog and retained the pasted token. | `keeps an unverified license locked and explains an invalid token inside the dialog`. |
| LTM-05 | Kept separate success/failure import counts. | `reports mixed import results without overstating the successful takes`. |
| LTM-06 | Kept immutable asset and update-friendly worker cache headers. | `src/delivery.test.ts`; live header check. |
| LTM-07 | Kept 44px home/legal targets and narrow-screen card layout. | `provides 44px home and legal link targets`; mobile route scan. |
| F-2-2 | Added six registrable claims for installability, no tracking resources, payment-field isolation, license storage, inactive-license responses, and local A/B playback. Removed the untestable merchant/refund and repository-credential statements. | `@claim:pwa-install`, `@claim:no-tracking`, `@claim:payment-isolation`, `@claim:license-storage`, `@claim:license-states`, and `@claim:comparison-playback`. |
| F-2-3 | Added internal-route tracking, heading focus, polite route announcements, and Back restoration without stealing focus on a cold arrival. | `moves focus to the route heading and announces internal navigation and browser back`; `restores a heading destination through demo, terms, and not-found history entries`; live route-focus check. |
| F-2-4 | Added **Play approved, then this take** for non-approved takes. It stops current audio, plays the approved sample then the candidate, updates its accessible state, and stays local. | `@claim:comparison-playback`; live demo action check. |
| F-2-5 | Renamed the header control to **See Studio — $19**. | Browser and copy-audit assertions. |
| F-2-6 | Replaced “WAV is the safest choice” with a recovery instruction and standardized all editable grouping labels to **line**. | `.factory/copy-audit.md`; `@claim:filename-grouping`. |

## Evidence to rerun

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run verify:live
```

The final clean-clone output, live URL evidence, screenshots, deployment ID, and commit are recorded in `.factory/handoff.md`.
