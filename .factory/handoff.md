# Line Take Match — build handoff

Work order: `line-take-match-build-1`
Completed: 2026-08-28

## What shipped

- A complete local takeboard for creator-owned WAV, MP3, M4A, OGG, and FLAC recordings. Multi-file import infers line groups from take/version filename suffixes, while every line assignment remains editable.
- On-device Web Audio analysis for RMS level (dBFS), total and active duration, pause ratio, pitch low/high/range, and normalized waveform peaks. Measurements are deliberately framed as cues rather than scores.
- Per-line manual approved-reference selection, unit-based deltas, measurement-cue thresholds, native audio playback, review flags, handoff notes, search, reversible removal, and formula-safe CSV export.
- IndexedDB persistence for original audio, analysis, references, flags, and notes. Studio backup export/import includes audio in a portable JSON file.
- A genuinely useful free tier (12 takes plus CSV) and a $19 one-time Studio tier (unlimited takes and project backups) using the required Sociobot checkout, return-token capture, once-daily verification cache, optimistic offline unlock, revoked-license handling, and paste-to-restore path. Accessibility, consent handling, and CSV export are not gated.
- Installable PWA with 192/512 and maskable icons, versioned generated precache manifest, offline navigation, runtime asset caching, persisted state, connectivity status, and update toast.
- Empty, loading, decode error, rights-consent error, free-limit, offline, update, and missing-backup-audio states; responsive 390px take cards and native keyboard-operable controls.
- `/privacy/` and `/terms/`, MIT license, production README, robots/sitemap, and the product-specific night-market design record.
- Original AI-generated booth scene, reviewed for stray text/brands/people and optimized from a 2.3 MB 1536×1024 source PNG to a 28 KB 768×512 WebP. Prompt, generator metadata, and provenance are in `.factory/design.md` and `assets/src/`.

## Run and verify

```bash
npm install
npm test
npm run build
npm run test:e2e
```

Production output is `dist/`, with `dist/index.html` at its root. `npm run build` is the exact deploy command.

Verification performed from a clean production build:

- Vitest: 6/6 passed (signal analysis, silence/activity, filename grouping, empty audio, CSV formula protection).
- Playwright 1.58.2: 4/4 passed across desktop Chromium and a 390×844 mobile viewport. The suite imported two real generated WAV payloads, selected a reference, flagged a take, restored IndexedDB state after reload, checked the consent block, ran axe, and reloaded the populated board with the browser offline.
- Axe via Playwright: no serious or critical violations on the populated takeboard in either viewport.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, total blocking time 0 ms, CLS 0, total transfer 54 KiB.
- Production bundle: 22.60 KB JS + 0.77 KB module preload helper, 15.79 KB app CSS; no runtime CDN/font/script dependencies. Hero WebP is 28 KB.
- Lighthouse runtime reported no page errors. Visual checks were completed at 1280px and 390px.

## Known limits and next steps

- Browser codec support varies by operating system, especially for M4A and FLAC. The app reports a direct retry message; WAV is the most portable interchange format.
- Pitch is a lightweight autocorrelation cue over voiced windows, not transcription, identity, emotion, or performance-quality analysis. Polyphonic material and very noisy takes may show no stable pitch; this is shown as an em dash rather than guessed.
- The factory must register the `line-take-match` product and configure its return URL before checkout can complete in production. No provider product ID or secret is stored here.
- This is a static product. Hosting must serve directory indexes for `/privacy/` and `/terms/`; the built `dist/` already contains them.
