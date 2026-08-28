# Line Take Match — adversarial review 3 handoff

## Outcome

Review 3 is complete with a **FAIL** verdict. No product code was changed.

The landing cold read is clear, every registered claim passes, the demo sandbox protects real data, routing/metadata/accessibility checks pass, and the visual identity remains distinct. Acceptance is blocked because the first demo viewport shows only intro and counts; the first take card begins below the fold at y=1262 on 390×844 and y=935 on 1280×800.

The full report is `.factory/review-3.md`.

## Findings left for the repair round

- `F-3-1 / F-1-2` — BLOCKING: show realistic sample take/comparison content inside the first demo viewport.
- `F-3-2 / F-2-2` — MAJOR: register and test “portable project backups” through re-import, or remove “portable.”
- `F-3-3` — MINOR: change “1 lines” to “1 line.”
- `F-3-4 / F-2-5` — MINOR: replace state-only button labels with result-naming actions.
- `F-3-5` — MINOR: wait for route focus/announcement in `verify:live` instead of asserting immediately.

## Verification performed

Fresh clone `/tmp/line-take-match-review3.C4R7Ux` at `830fd8e60c29e07f377537083d921968202b085b`:

- `npm ci` — passed; zero vulnerabilities.
- All 16 commands in `.factory/claims.json` — passed independently.
- `npm test` — 13/13 passed.
- `npm run build` — passed; `dist/index.html` exists.
- `npm run test:e2e -- --workers=1` — 58/58 passed.
- `/opt/fleet/lib/verify-url.sh` — root, Demo, Privacy, and Terms passed.
- Live route/metadata/link/axe crawl — expected statuses, complete metadata, and zero axe violations at 390px and desktop.
- Live demo sentinel/reset/exit/offline/request interception — passed.
- Live checkout — 303 to Dodo; hosted page showed Line Take Match at $19.00.
- `npm run verify:live` repeated five times — two passed, three failed at the immediate Privacy focus check; focus arrived within 10–20 ms in independent sampling.

## Next step

Repair the five findings above, deploy through the factory, then repeat the entire review rather than only the changed checks.
