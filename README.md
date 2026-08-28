# Compare voice takes with an approved take

Line Take Match helps indie animators and game creators compare recorded dialogue with an approved take. It measures level, pace, pauses, and pitch range as review cues. It does not transcribe, generate, clone, or upload voices.

Audio and take data stay in your browser. After one online visit, you can install the app and use it offline.

Free mode supports 12 takes and CSV export. Studio costs $19 once. It adds unlimited takes and backups that include audio.

Live app: <https://line-take-match.sociobot.in>

One-click demo: <https://line-take-match.sociobot.in/?demo=1>

The demo opens three sample dialogue takes. It uses separate browser storage and clears that storage when you start for real.

## Run locally

```bash
npm ci
npm run dev
```

Open the shown local URL. Confirm performer consent, then import audio your browser can play. WAV is the safest choice.

Numbered filenames such as `_take-03` or `_v2` group by line. You can edit every line name.

## Test and build

```bash
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run verify:live
```

The production command checks types and builds every page. It then adds the current files to the offline cache. Deploy the generated `dist/` directory.

The browser suite uses Playwright 1.58.2. It covers desktop, 390px mobile, browser storage, accessibility, privacy, and offline reload.

The live verifier checks the deployed demo, routes, 404, checkout, manifest, isolation, offline reload, focus, mobile layout, and accessibility.

## Data and privacy

- Recordings, measurements, flags, line names, notes, and licenses stay in browser storage.
- The demo uses the separate `demo:line-take-match` database.
- CSV exports stay free.
- Studio backups contain the audio itself. Treat them like source recordings.
- License verification is the only optional request to Sociobot.
- The app has no analytics, trackers, remote fonts, transcription calls, or generation calls.

Read the [privacy policy](./privacy/index.html), [terms](./terms/index.html), [research brief](./.factory/brief.json), and [visual system](./.factory/design.md).

## Deployment

Deploy `dist/` to an HTTPS static host that serves directory index files. Unknown paths must use `404/index.html` with status 404.

The factory owns infrastructure, DNS, and paid-product registration. This repository does not contain billing credentials.

Licensed under the [MIT License](./LICENSE).
