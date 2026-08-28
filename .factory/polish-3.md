# Polish round 3 — zero-finding closure

Sources read before repair: every `.factory/review-*.md`,
`.factory/polish-*.md`, `.factory/verification*.md`, the brief, and the visual
thesis. Repair commit: `ea8432eedf027124bb5d63d2c1d557859973f808`.

Live evidence URL: <https://line-take-match.sociobot.in/?demo=1>.
The mobile and desktop cold screenshots are
`.factory/evidence/live/demo-polish-3-mobile.png` and
`.factory/evidence/live/demo-polish-3-desktop.png`.

| Finding id | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the task-first headline, named audience, sample action, and three facts in the first phone viewport. | Clean-clone browser: `states the job…`; live `/` verifier passed. |
| F-1-2 | Kept the isolated `demo:line-take-match` sample board, reset, exit cleanup, and offline reload. Round 3 moves a real comparison into its first viewport. | `@claim:demo-sandbox`, `@claim:offline-reload`; live `/?demo=1`. |
| F-1-3 / LTM-01 | Kept the working Sociobot checkout route and production return flow. | Live verifier: checkout HTTP 303 to Dodo; `@claim:billing-api`. |
| F-1-4 / F-2-1 | Kept the 16-entry registry and observable claim assertions; expanded the backup claim to test a clean-context restoration. | Every exact command in `.factory/claims.json` passed from a clean clone. |
| F-1-5 | Kept distinct Demo, Privacy, Terms, and 404 documents with metadata and route-specific titles. | Live verifier: 200 on real routes, designed 404 with status 404. |
| F-1-6 / LTM-08 | Kept `#main` focus transfer on skip links. | `moves focus to main content from the skip link`; live verifier passed. |
| F-1-7 | Kept literal headings and consistent take-list terminology. | `.factory/copy-audit.md`. |
| F-1-8 | Kept short README and landing copy. | `.factory/copy-audit.md`; no prose sentence is over 22 words. |
| LTM-02 | Kept token-bound cached validity; an unverified token stays locked. | `src/license.test.ts`; license browser regression. |
| LTM-03 | Kept equivalent-focus restoration after reference, flag, and line updates. | `keeps keyboard focus on the updated reference, flag, and line controls`. |
| LTM-04 | Kept visible, announced license feedback inside the open dialog. | `keeps an unverified license locked and explains an invalid token inside the dialog`. |
| LTM-05 | Kept separate successful and failed import counts. | `reports mixed import results without overstating the successful takes`. |
| LTM-06 | Kept immutable hashed assets and update-friendly shell/worker headers. | `src/delivery.test.ts`; live asset headers. |
| LTM-07 | Kept 44px link targets and the stacked phone take cards. | Mobile browser route scan; live 390px overflow check passed. |
| F-2-2 | Kept registrable privacy, install, license, payment, and playback claims; the last unlisted portability promise is now registered. | `@claim:no-tracking`, `@claim:pwa-install`, `@claim:payment-isolation`, `@claim:license-storage`, `@claim:license-states`, `@claim:studio-backup`. |
| F-2-3 | Kept internal route/back heading focus and polite announcements. | Browser route-history tests; `npm run verify:live` passed three consecutive runs. |
| F-2-4 | Kept one-action approved-then-candidate playback. | `@claim:comparison-playback`; visible live demo action. |
| F-2-5 | Replaced the licensed-header state label with **Manage Studio license**. | Live DOM check; `demo-polish-3-mobile.png`. |
| F-2-6 | Kept concrete WAV recovery guidance and the single term **line**. | `.factory/copy-audit.md`; `@claim:filename-grouping`. |
| F-3-1 / reopened F-1-2 | Rebuilt the demo introduction as a compact sample proof. It shows both take names, a level delta, and the playback action before the tools. | `shows a working sample comparison in the first demo viewport`; live proof bottoms: 505px at 390×844 and 344px at 1280×800. |
| F-3-2 / reopened F-2-2 | Registered “portable backups” and added a real export → clean browser context → import flow. It verifies take count, line, note, measurement, flag, approved state, and playable audio. The empty state now exposes **Import a project backup**, so a clean take list can actually restore it. | `@claim:studio-backup` from clean clone. |
| F-3-3 | Added singular/plural rendering for line and take counts. | Live demo DOM reports `1 LINE`; `demo-polish-3-mobile.png`. |
| F-3-4 / reopened F-2-5 | Rendered **Approved take** as a non-action status, renamed the pressed flag action to **Remove review flag**, and renamed licensed header action to **Manage Studio license**. | Live DOM assertion; browser focus regression. |
| F-3-5 | Changed the release verifier from immediate booleans to bounded Playwright focus/text polling. | `npm run verify:live` passed three consecutive live runs. |
| Verification-3 manifest observation | Kept the configured manifest MIME type. | Live verifier: `application/manifest+json`. |

## Release evidence

- Fresh clean clone: `/tmp/line-take-match-polish3-clean.86cTXM` at repair commit.
  `npm ci` (0 vulnerabilities), `npm test` (13/13), and `npm run build` passed.
- All 16 exact registry commands passed independently from that clone. The full
  browser suite then passed 60/60 with `npm run test:e2e -- --workers=1`.
- Local and live axe scans found 0 violations on root, demo, Privacy, Terms,
  and 404 at 390px. No horizontal overflow occurred.
- Local and live Lighthouse demo results: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; live FCP 1.1s, LCP 1.2s, CLS 0.
- Azure Static Web Apps production deploy completed to
  `ambitious-mushroom-0643cb00f.7.azurestaticapps.net`; the custom live site
  serves `main-BwensW1N.js` from this repair build.
