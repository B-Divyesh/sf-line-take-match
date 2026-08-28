# Line Take Match

Line Take Match is a private, local-first takeboard for indie animators and game creators. Import creator-owned dialogue takes, group them by line, choose the approved reference, compare level/pace/pause/pitch-range cues, flag mismatches, and export a handoff CSV. It does not transcribe, generate, or clone voices.

All audio analysis and project storage happens in the browser. The installable PWA works offline after its first load. Free mode supports 12 takes with unlimited CSV exports; the optional $19 one-time Studio license adds unlimited takes and audio-inclusive project backups through Sociobot billing.

Live: <https://line-take-match.sociobot.in>

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL, confirm that you have the performer’s consent, and import WAV, MP3, M4A, OGG, or FLAC files. Filenames ending in patterns such as `_take-03` or `_v2` are grouped automatically; every line assignment remains editable.

## Test and build

```bash
npm test
npm run build
npm run test:e2e
```

`npm run build` is the exact production command. It type-checks the app, builds all entry points, injects the versioned offline precache list, and writes the deployable static site to `dist/` with `dist/index.html` at its root. The browser suite uses Playwright 1.58.2 and exercises desktop, 390px mobile, IndexedDB persistence, accessibility, and offline reload.

To inspect the production output:

```bash
npm run preview
```

## Data and privacy

- Recordings, metrics, flags, line labels, notes, and licenses stay in browser storage.
- Audio decoding and measurements use the Web Audio API on-device.
- CSV exports remain free. Studio JSON backups contain the audio itself; treat them like source recordings.
- The only optional API request verifies a Studio license with Sociobot. There are no analytics, trackers, third-party fonts, runtime CDNs, transcription calls, or generation calls.

See [privacy](./privacy/index.html), [terms](./terms/index.html), [the researched brief](./.factory/brief.json), and [the product-specific visual system](./.factory/design.md).

## Deployment

Deploy the contents of `dist/` to any HTTPS static host with clean-directory paths enabled. The factory owns infrastructure, DNS, and registration of the paid product; this repository does not provision them.

Licensed under the [MIT License](./LICENSE).
