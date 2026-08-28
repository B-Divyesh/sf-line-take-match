import './styles.css';
import { analyzeFile } from './analysis';
import { createTakeStore } from './db';
import { makeDemoTakes } from './demo';
import { download, makeBackup, readBackup, toCsv } from './export';
import { captureReturnedLicense, checkoutUrl, clearLicense, hasOptimisticUnlock, saveLicense, verifyLicense } from './license';
import { inferLineName, uniqueLines } from './naming';
import { focusAndAnnounceRoute, installBackRouteFocus, shouldFocusRouteHeading, trackInternalRoutes } from './route-focus';
import type { Metrics, Take } from './types';

const FREE_LIMIT = 12;
const app = document.querySelector<HTMLDivElement>('#app')!;
const demoMode = /^\/demo\/?$/.test(location.pathname) || new URLSearchParams(location.search).get('demo') === '1';
const takeStore = createTakeStore(demoMode);
const urls = new Map<string, string>();
let takes: Take[] = [];
let selectedLine = '';
let search = '';
let loading = true;
let processing = '';
let error = '';
let notice = '';
let consent = false;
let unlocked = false;
let undoTake: Take | null = null;
let undoTimer = 0;
let noticeTimer = 0;
let focusAfterRender = '';
let licenseError = '';
let licenseToken = '';
let licenseTrigger: HTMLElement | null = null;
let comparisonPlayback: { referenceId: string; candidateId: string; phase: 'approved' | 'candidate' } | null = null;
let moveFocusToRouteHeading = shouldFocusRouteHeading();

if (demoMode) setDemoMetadata();
if (!demoMode) captureReturnedLicense();
unlocked = demoMode || hasOptimisticUnlock();
trackInternalRoutes();
installBackRouteFocus();
document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  history.replaceState(null, '', `${location.pathname}${location.search}#main`);
  document.querySelector<HTMLElement>('#main')?.focus();
});
void start();

async function start() {
  try {
    takes = await takeStore.all();
    if (demoMode && takes.length === 0) {
      takes = makeDemoTakes();
      await Promise.all(takes.map((take) => takeStore.put(take)));
    }
    takes.sort((a, b) => a.createdAt - b.createdAt);
    selectedLine = uniqueLines(takes)[0] ?? '';
  } catch {
    error = 'Your browser blocked local storage. Audio can be analyzed, but it will not survive a refresh.';
  } finally {
    loading = false;
    render();
  }
  if (!demoMode && localStorage.getItem('sb_license:line-take-match')) {
    const verification = await verifyLicense();
    const valid = verification === 'valid';
    if (valid !== unlocked) {
      unlocked = valid;
      notice = valid ? 'Studio unlocked on this device.' : verification === 'invalid' ? 'This license is no longer active. Free mode is still available.' : '';
      render();
    }
  }
  registerServiceWorker();
}

function render() {
  const activeKey = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.focusKey ?? '' : '';
  const lines = uniqueLines(takes);
  if (selectedLine && !lines.includes(selectedLine)) selectedLine = lines[0] ?? '';
  const visibleLines = lines.filter((line) => line.toLowerCase().includes(search.toLowerCase()));
  const current = takes.filter((take) => take.line === selectedLine);
  const reference = current.find((take) => take.reference);
  const flagged = takes.filter((take) => take.flagged).length;
  const freeRemaining = Math.max(0, FREE_LIMIT - takes.length);

  app.innerHTML = `
    <header class="site-header">
      <a class="brand" href="/" aria-label="Line Take Match home"><span class="brand-mark" aria-hidden="true">LT</span><span>Line Take Match</span></a>
      <nav class="site-nav" aria-label="Primary"><a href="/?demo=1" ${demoMode ? 'aria-current="page"' : ''}>Demo</a><a href="/privacy/">Privacy</a>${demoMode ? '' : `<button class="button quiet" data-action="show-license">${unlocked ? 'Manage Studio license' : 'See Studio — $19'}</button>`}</nav>
    </header>
    ${demoMode ? demoBannerMarkup() : ''}
    <main id="main" tabindex="-1">
      ${demoMode ? demoIntroMarkup(reference, current.find((take) => !take.reference) ?? current[0]) : `<section class="hero ${takes.length ? 'hero-compact' : ''}" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">Voice take comparison</p>
          <h1 id="page-title">Compare voice takes<br><em>with an approved take.</em></h1>
          <p class="lede">For indie animators and game creators checking whether recorded character lines match.</p>
          <div class="hero-actions"><a class="button primary" href="/?demo=1">Try it with sample data</a><a class="button secondary" href="#import-title">Import audio takes</a></div>
          <p class="action-note">The demo opens three dialogue takes to compare.</p>
          <div class="trust-strip" aria-label="Product facts"><span>Audio stays on this device</span><span>Works offline after the first visit</span><span>Free for 12 takes · Studio costs $19 once</span></div>
        </div>
        <picture class="hero-art">
          <source srcset="/assets/hero-night-booth.webp" type="image/webp">
          <img src="/assets/hero-night-booth.webp" width="768" height="512" fetchpriority="high" alt="An empty voice booth glowing behind a rain-soaked night-market window, with a microphone and waveform-shaped paper strips">
        </picture>
      </section>`}

      ${demoMode ? (loading ? loadingMarkup() : boardMarkup(visibleLines, current, reference, flagged)) : importMarkup(freeRemaining)}
      ${demoMode ? importMarkup(freeRemaining) : (loading ? loadingMarkup() : takes.length ? boardMarkup(visibleLines, current, reference, flagged) : emptyMarkup())}
      ${demoMode ? '' : informationMarkup()}
      ${licenseMarkup()}
    </main>
    ${footerMarkup()}
    <div class="toast ${notice ? 'is-visible' : ''}" role="status" aria-live="polite">${escapeHtml(notice)} ${undoTake ? '<button data-action="undo">Undo</button>' : ''}</div>
  `;
  bindEvents();
  if (moveFocusToRouteHeading) {
    moveFocusToRouteHeading = false;
    requestAnimationFrame(focusAndAnnounceRoute);
  }
  const focusKey = focusAfterRender || activeKey;
  focusAfterRender = '';
  if (focusKey) requestAnimationFrame(() => focusByKey(focusKey));
  clearTimeout(noticeTimer);
  if (notice && !undoTake) {
    noticeTimer = window.setTimeout(() => { notice = ''; render(); }, 5000);
  }
}

function importMarkup(freeRemaining: number) {
  return `<section class="import-panel" aria-labelledby="import-title">
        <div>
          <p class="section-kicker">${demoMode ? '03' : '01'} / Import</p>
          <h2 id="import-title">Import audio takes</h2>
          <p>Choose audio files your browser can play. If another format fails, convert it to WAV and try again. Filenames such as <code>door-warning_take-03.wav</code> group by line.</p>
        </div>
        <label class="consent-check"><input id="consent" type="checkbox" ${consent ? 'checked' : ''}><span>I have the performer’s consent and rights to review these recordings.</span></label>
        <label class="drop-zone ${processing ? 'is-processing' : ''}" id="drop-zone" tabindex="0">
          <input id="audio-files" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac" multiple ${processing ? 'disabled' : ''}>
          <span class="drop-icon" aria-hidden="true">↳</span>
          <strong>${processing || 'Import audio takes'}</strong>
          <span>${demoMode ? 'Imports stay inside this demo' : unlocked ? 'Studio has no take limit' : `${freeRemaining} of ${FREE_LIMIT} free takes remain`}</span>
        </label>
        ${error ? `<p class="message error" role="alert">${escapeHtml(error)}</p>` : ''}
      </section>`;
}

function demoBannerMarkup() {
  return `<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved to your take list</strong><div><button class="button secondary" data-action="reset-demo">Reset demo</button><button class="button primary" data-action="start-real">Start for real</button></div></aside>`;
}

function demoIntroMarkup(reference?: Take, candidate?: Take) {
  const candidateDelta = reference && candidate && candidate.id !== reference.id
    ? delta(candidate.metrics.loudness, reference.metrics.loudness, ' dB')
    : 'Loading sample difference';
  return `<section class="demo-intro" aria-labelledby="page-title"><div class="demo-intro-copy"><p class="eyebrow">Sample take list</p><h1 id="page-title">Compare sample takes.</h1><p>Hear the approved read, then one alternative.</p></div>${reference && candidate && candidate.id !== reference.id ? `<aside class="demo-proof" aria-label="Sample comparison">
    <div class="demo-proof-label"><span>Approved take</span><strong>${escapeHtml(reference.name)}</strong></div>
    <div class="demo-proof-arrow" aria-hidden="true">→</div>
    <div class="demo-proof-label"><span>Compare with</span><strong>${escapeHtml(candidate.name)}</strong></div>
    <div class="demo-proof-delta"><span>Level</span><strong>${candidateDelta}</strong></div>
    <button class="chip compare-play" data-action="compare-play" data-id="${candidate.id}" aria-pressed="${comparisonPlayback?.candidateId === candidate.id}">${comparisonPlayback?.candidateId === candidate.id ? comparisonPlayback.phase === 'approved' ? 'Playing approved take…' : 'Playing this take…' : 'Play approved, then this take'}</button>
  </aside>` : ''}</section>`;
}

function informationMarkup() {
  return `<section class="how-it-works" aria-labelledby="how-title"><p class="section-kicker">03 / Workflow</p><h2 id="how-title">Compare recorded takes</h2><ol><li><strong>Import audio.</strong><span>Filenames group takes for the same line.</span></li><li><strong>Choose the approved take.</strong><span>Compare level, pace, pauses, and pitch range.</span></li><li><strong>Flag and export.</strong><span>Add notes and download a CSV for your team.</span></li></ol></section>
  <section class="boundaries" aria-labelledby="boundaries-title"><p class="section-kicker">04 / Boundaries</p><h2 id="boundaries-title">Keep the performance human</h2><p>Line Take Match does not transcribe, generate, or clone voices. Measurements are review cues, never performance scores.</p></section>
  <section class="studio-strip" aria-labelledby="studio-title"><div><p class="section-kicker">05 / Studio</p><h2 id="studio-title">Keep larger take lists together</h2><p>Free mode includes 12 takes and CSV exports. Studio costs $19 once and adds unlimited takes and audio backups.</p></div><button class="button primary" data-action="show-license">See Studio details</button></section>`;
}

function footerMarkup() {
  return `<footer><p>Compare recorded voice takes without uploading audio.</p><nav aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Built by Param Factory</span><span>v1.1.0 · polish-3</span></nav></footer>`;
}

function loadingMarkup() {
  return `<section class="state-panel" aria-live="polite"><span class="meter" aria-hidden="true"></span><h2>Opening your take list…</h2></section>`;
}

function emptyMarkup() {
  return `<section class="empty-state" aria-labelledby="empty-title"><div class="signal-glyph" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><p class="section-kicker">02 / Compare</p><h2 id="empty-title">Your takes will appear here</h2><p>Import two or more recordings of one line. Choose the approved take, then listen to any measured differences.</p><ol><li>Group takes by filename</li><li>Choose the take to compare against</li><li>Flag a take and export CSV</li></ol><div class="empty-actions"><button class="button secondary" data-action="import-backup">Import a project backup</button><input id="backup-file" type="file" accept="application/json,.json" hidden></div></div></section>`;
}

function boardMarkup(lines: string[], current: Take[], reference: Take | undefined, flagged: number) {
  return `<section class="board" aria-labelledby="board-title">
    <div class="board-heading"><div><p class="section-kicker">02 / Compare</p><h2 id="board-title">Take list</h2></div><div class="summary"><span><b>${uniqueLines(takes).length}</b> ${uniqueLines(takes).length === 1 ? 'line' : 'lines'}</span><span><b>${takes.length}</b> ${takes.length === 1 ? 'take' : 'takes'}</span><span><b>${flagged}</b> flagged</span></div></div>
    <div class="board-tools">
      <label class="search"><span>Find a line</span><input id="search" type="search" value="${escapeAttr(search)}" placeholder="Search line names"></label>
      <div class="export-actions"><button class="button secondary" data-action="import-backup">Import backup</button><input id="backup-file" type="file" accept="application/json,.json" hidden><button class="button secondary" data-action="backup" ${unlocked ? '' : 'aria-describedby="backup-lock"'}>Back up project${unlocked ? '' : ' · Studio'}</button><button class="button primary" data-action="csv">Export CSV</button></div>
    </div>
    <div class="board-grid">
      <aside class="line-list" aria-label="Lines"><div class="line-list-label">Lines <span>${lines.length}</span></div>${lines.length ? lines.map(lineButton).join('') : '<p class="no-results">No lines match that search.</p>'}</aside>
      <div class="take-area">
        ${selectedLine ? `<div class="line-heading"><div><p>Selected line</p><h3>${escapeHtml(selectedLine)}</h3></div><span>${current.length} take${current.length === 1 ? '' : 's'}</span></div>
        <p class="cue-note"><span aria-hidden="true">◎</span>${reference ? `Differences use “${escapeHtml(reference.name)}” as the approved take. Listen before you decide.` : 'Choose one approved take to reveal differences.'}</p>
        <div class="measure-legend" aria-hidden="true"><span>Take & waveform</span><span>Level</span><span>Pace</span><span>Pauses</span><span>Pitch range</span><span>Actions</span></div>
        <div class="takes">${current.map((take) => takeMarkup(take, reference)).join('')}</div>` : ''}
      </div>
    </div>
    <p id="backup-lock" class="visually-hidden">Project backup requires Studio. CSV export remains free.</p>
  </section>`;
}

function lineButton(line: string) {
  const lineTakes = takes.filter((take) => take.line === line);
  const flagged = lineTakes.filter((take) => take.flagged).length;
  return `<button class="line-button ${line === selectedLine ? 'active' : ''}" data-line="${escapeAttr(line)}" data-focus-key="line:${escapeAttr(line)}" aria-current="${line === selectedLine ? 'true' : 'false'}"><span>${escapeHtml(line)}</span><small>${lineTakes.length} takes${flagged ? ` · ⚑ ${flagged}` : ''}</small></button>`;
}

function takeMarkup(take: Take, reference?: Take) {
  const metrics = take.metrics;
  const objectUrl = take.blob ? getObjectUrl(take) : '';
  const flaggedCues = reference && reference.id !== take.id ? reviewCueCount(metrics, reference.metrics) : 0;
  return `<article class="take-card ${take.reference ? 'is-reference' : ''} ${take.flagged ? 'is-flagged' : ''}">
    <div class="take-identity">
      <div class="take-label"><span>${take.reference ? 'Approved take' : take.flagged ? 'Flagged for review' : flaggedCues ? `${flaggedCues} measurement cue${flaggedCues > 1 ? 's' : ''}` : 'Take'}</span><strong>${escapeHtml(take.name)}</strong></div>
      ${objectUrl ? `<audio controls preload="none" src="${objectUrl}" data-audio-id="${take.id}" aria-label="Play ${escapeAttr(take.name)}"></audio>` : '<p class="missing-audio">Audio missing from imported backup</p>'}
      ${waveform(metrics, take.name)}
      <label class="line-field"><span>Line</span><input data-field="line" data-id="${take.id}" value="${escapeAttr(take.line)}"></label>
    </div>
    ${metricCell('Level', `${metrics.loudness.toFixed(1)} dBFS`, delta(metrics.loudness, reference?.metrics.loudness, ' dB', false), Math.min(100, Math.max(4, (metrics.loudness + 60) * 2.1)))}
    ${metricCell('Pace', `${metrics.duration.toFixed(2)} s`, delta(metrics.duration, reference?.metrics.duration, ' s'), Math.min(100, metrics.duration / Math.max(...takes.filter(t => t.line === take.line).map(t => t.metrics.duration)) * 100))}
    ${metricCell('Pauses', `${Math.round(metrics.pauseRatio * 100)}%`, delta(metrics.pauseRatio * 100, reference ? reference.metrics.pauseRatio * 100 : undefined, ' pts'), metrics.pauseRatio * 100)}
    ${metricCell('Pitch range', metrics.pitchRange == null ? '—' : `${metrics.pitchRange.toFixed(1)} st`, metrics.pitchRange == null ? 'No stable pitch found' : delta(metrics.pitchRange, reference?.metrics.pitchRange ?? undefined, ' st'), Math.min(100, (metrics.pitchRange ?? 0) * 8))}
    <div class="take-actions">
      ${take.reference ? `<span class="chip active status-chip" role="status" tabindex="-1" data-focus-key="reference:${take.id}">Approved take</span>` : `<button class="chip" data-action="reference" data-id="${take.id}" data-focus-key="reference:${take.id}" aria-pressed="false">Set as approved</button>`}
      ${reference && reference.id !== take.id && objectUrl && reference.blob ? `<button class="chip compare-play" data-action="compare-play" data-id="${take.id}" aria-pressed="${comparisonPlayback?.candidateId === take.id}">${comparisonPlayback?.candidateId === take.id ? comparisonPlayback.phase === 'approved' ? 'Playing approved take…' : 'Playing this take…' : 'Play approved, then this take'}</button>` : ''}
      <button class="chip ${take.flagged ? 'warning' : ''}" data-action="flag" data-id="${take.id}" data-focus-key="flag:${take.id}" aria-pressed="${take.flagged}">${take.flagged ? 'Remove review flag' : 'Flag review'}</button>
      <label class="note-field"><span>Review note</span><input data-field="note" data-id="${take.id}" value="${escapeAttr(take.note)}" placeholder="Direction note"></label>
      <button class="icon-button" data-action="remove" data-id="${take.id}" aria-label="Remove ${escapeAttr(take.name)}">Remove</button>
    </div>
  </article>`;
}

function metricCell(label: string, value: string, comparison: string, width: number) {
  return `<div class="metric"><span class="mobile-label">${label}</span><strong>${value}</strong><span class="delta">${comparison}</span><span class="bar"><i style="width:${Math.max(2, width)}%"></i></span></div>`;
}

function waveform(metrics: Metrics, name: string) {
  return `<div class="waveform" role="img" aria-label="Waveform overview for ${escapeAttr(name)}">${metrics.peaks.map((peak) => `<i style="height:${Math.max(4, peak * 100)}%"></i>`).join('')}</div>`;
}

function delta(value: number, reference: number | undefined, suffix: string, percent = false) {
  if (reference == null) return 'Choose approved take';
  const difference = percent && reference ? ((value - reference) / reference) * 100 : value - reference;
  if (Math.abs(difference) < 0.05) return 'Matches approved take';
  return `${difference > 0 ? '+' : ''}${difference.toFixed(1)}${percent ? '%' : suffix} difference`;
}

function reviewCueCount(metrics: Metrics, reference: Metrics) {
  return [
    Math.abs(metrics.loudness - reference.loudness) > 3,
    Math.abs(metrics.duration - reference.duration) / Math.max(reference.duration, 0.1) > 0.15,
    Math.abs(metrics.pauseRatio - reference.pauseRatio) > 0.1,
    metrics.pitchRange != null && reference.pitchRange != null && Math.abs(metrics.pitchRange - reference.pitchRange) > 3,
  ].filter(Boolean).length;
}

function licenseMarkup() {
  return `<dialog id="license-dialog" class="license-dialog"><button class="dialog-close" data-action="close-license" aria-label="Close Studio details">×</button><p class="section-kicker">Studio license</p><h2>${unlocked ? 'Your full take list is open' : 'Keep all your takes together'}</h2><p>Free mode compares up to ${FREE_LIMIT} takes and includes CSV export. Studio costs <strong>$19 once</strong>. It adds unlimited takes and portable project backups.</p><ul><li>Unlimited takes and lines on this device</li><li>Download a backup with your audio</li><li>Core comparison and CSV stay free</li></ul>${unlocked ? '<p class="message success">License active on this device.</p><button class="button quiet" data-action="clear-license">Remove license from device</button>' : `<a class="button primary buy" href="${checkoutUrl}">Buy Studio — $19 once</a><form id="license-form"><label><span>Have a license? Paste it here</span><input id="license-token" value="${escapeAttr(licenseToken)}" required aria-describedby="license-feedback" autocomplete="off" spellcheck="false"></label><button class="button secondary" type="submit">Verify and restore</button></form>${licenseError ? `<p id="license-feedback" class="message error" role="alert" aria-live="assertive">${escapeHtml(licenseError)}</p>` : '<p id="license-feedback" class="visually-hidden">Paste your Studio license token, then verify and restore it.</p>'}`}<p class="legal-note">Studio checkout opens on Sociobot. A revoked license no longer unlocks Studio. See <a href="/privacy/">privacy</a> and <a href="/terms/">terms</a>.</p></dialog>`;
}

function bindEvents() {
  const input = document.querySelector<HTMLInputElement>('#audio-files');
  input?.addEventListener('change', () => void addFiles(input.files));
  document.querySelector('#consent')?.addEventListener('change', (event) => { consent = (event.target as HTMLInputElement).checked; });
  const dropZone = document.querySelector<HTMLElement>('#drop-zone');
  dropZone?.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('dragging'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
  dropZone?.addEventListener('drop', (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); void addFiles(event.dataTransfer?.files ?? null); });
  dropZone?.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input?.click(); } });
  document.querySelector('#search')?.addEventListener('input', (event) => { search = (event.target as HTMLInputElement).value; render(); document.querySelector<HTMLInputElement>('#search')?.focus(); });
  document.querySelectorAll<HTMLElement>('[data-line]').forEach((element) => element.addEventListener('click', () => { selectedLine = element.dataset.line ?? ''; focusAfterRender = element.dataset.focusKey ?? ''; render(); }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', () => void handleAction(element.dataset.action ?? '', element.dataset.id, element)));
  document.querySelectorAll<HTMLInputElement>('[data-field]').forEach((element) => element.addEventListener('change', () => void updateField(element)));
  document.querySelectorAll<HTMLAudioElement>('audio[data-audio-id]').forEach((audio) => audio.addEventListener('play', () => {
    if (comparisonPlayback && audio.dataset.audioId !== comparisonPlayback.referenceId && audio.dataset.audioId !== comparisonPlayback.candidateId) stopComparison();
  }));
  document.querySelector('#license-form')?.addEventListener('submit', (event) => void restoreLicense(event));
  document.querySelector('#backup-file')?.addEventListener('change', (event) => void importBackup((event.target as HTMLInputElement).files?.[0]));
}

async function addFiles(fileList: FileList | null) {
  error = '';
  const files = [...(fileList ?? [])].filter((file) => file.type.startsWith('audio/') || /\.(wav|mp3|m4a|ogg|flac)$/i.test(file.name));
  if (!files.length) { error = 'No supported audio files were selected.'; render(); return; }
  if (!consent) { error = 'Confirm performer consent and recording rights before importing audio.'; render(); return; }
  if (!unlocked && takes.length + files.length > FREE_LIMIT) {
    error = `Free mode holds ${FREE_LIMIT} takes. Select fewer files or buy Studio for a larger take list.`;
    render();
    document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal();
    return;
  }
  let succeeded = 0;
  const failures: string[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    processing = `Analyzing ${index + 1} of ${files.length}: ${file.name}`;
    render();
    try {
      const metrics = await analyzeFile(file, (message) => { processing = `${message} ${file.name}`; });
      const line = inferLineName(file.name);
      const take: Take = { id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), line, blob: file, mime: file.type, size: file.size, createdAt: Date.now() + index, metrics, reference: false, flagged: false, note: '' };
      try {
        await takeStore.put(take);
      } catch {
        error = 'This take was analyzed, but browser storage is unavailable. Export before closing this tab.';
      }
      takes.push(take);
      selectedLine ||= line;
      succeeded += 1;
    } catch (cause) {
      failures.push(`${file.name}: ${cause instanceof Error ? cause.message : 'Analysis failed.'}`);
    }
  }
  processing = '';
  error = failures.join(' ');
  notice = failures.length
    ? `${succeeded} file${succeeded === 1 ? '' : 's'} processed locally; ${failures.length} file${failures.length === 1 ? '' : 's'} could not be analyzed.`
    : `${succeeded} file${succeeded === 1 ? '' : 's'} processed locally.`;
  render();
}

async function handleAction(action: string, id?: string, source?: HTMLElement) {
  if (action === 'show-license') { licenseTrigger = source ?? null; document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal(); return; }
  if (action === 'close-license') { document.querySelector<HTMLDialogElement>('#license-dialog')?.close(); licenseTrigger?.focus(); return; }
  if (action === 'reset-demo' && demoMode) {
    urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear();
    await takeStore.clear(); takes = makeDemoTakes(); await Promise.all(takes.map((take) => takeStore.put(take)));
    selectedLine = 'door warning'; search = ''; notice = 'Demo reset to the three sample takes.'; render(); return;
  }
  if (action === 'start-real' && demoMode) {
    await takeStore.clear(); location.assign('/'); return;
  }
  if (action === 'compare-play') {
    const candidate = takes.find((item) => item.id === id);
    if (candidate) await playComparison(candidate);
    return;
  }
  if (action === 'csv') { download(toCsv(takes), `line-take-match-${dateStamp()}.csv`, 'text/csv;charset=utf-8'); notice = 'CSV exported.'; render(); return; }
  if (action === 'backup') {
    if (!unlocked) { document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal(); return; }
    processing = 'Packing local audio into your backup…'; render();
    download(await makeBackup(takes), `line-take-match-${dateStamp()}.json`, 'application/json'); processing = ''; notice = 'Portable project backup exported.'; render(); return;
  }
  if (action === 'import-backup') { document.querySelector<HTMLInputElement>('#backup-file')?.click(); return; }
  if (action === 'clear-license') { clearLicense(); unlocked = false; document.querySelector<HTMLDialogElement>('#license-dialog')?.close(); notice = 'License removed from this device.'; render(); return; }
  if (action === 'undo' && undoTake) { clearTimeout(undoTimer); takes.push(undoTake); await takeStore.put(undoTake); undoTake = null; notice = 'Take restored.'; render(); return; }
  const take = takes.find((item) => item.id === id);
  if (!take) return;
  if (action === 'reference') {
    takes.filter((item) => item.line === take.line).forEach((item) => { item.reference = item.id === take.id; void takeStore.put(item); });
    notice = `${take.name} is now the approved take.`;
  } else if (action === 'flag') {
    take.flagged = !take.flagged; await takeStore.put(take); notice = take.flagged ? 'Take flagged for review.' : 'Review flag removed.';
  } else if (action === 'remove') {
    if (!confirm(`Remove “${take.name}” from this device? You can undo for 8 seconds.`)) return;
    takes = takes.filter((item) => item.id !== take.id); await takeStore.remove(take.id); undoTake = take; notice = `${take.name} removed.`;
    undoTimer = window.setTimeout(() => { undoTake = null; notice = ''; render(); }, 8000);
  }
  focusAfterRender = source?.dataset.focusKey ?? '';
  render();
}

function stopAllAudio() {
  document.querySelectorAll<HTMLAudioElement>('audio').forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function stopComparison() {
  stopAllAudio();
  comparisonPlayback = null;
  render();
}

async function playComparison(candidate: Take) {
  const reference = takes.find((take) => take.line === candidate.line && take.reference);
  if (!reference?.blob || !candidate.blob) {
    notice = 'Choose an approved take with audio before comparing playback.';
    render();
    return;
  }
  if (comparisonPlayback?.candidateId === candidate.id) {
    stopComparison();
    return;
  }
  stopAllAudio();
  comparisonPlayback = { referenceId: reference.id, candidateId: candidate.id, phase: 'approved' };
  render();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const approvedAudio = document.querySelector<HTMLAudioElement>(`audio[data-audio-id="${reference.id}"]`);
  const candidateAudio = document.querySelector<HTMLAudioElement>(`audio[data-audio-id="${candidate.id}"]`);
  if (!approvedAudio || !candidateAudio) return stopComparison();
  const finish = () => {
    comparisonPlayback = null;
    render();
  };
  approvedAudio.addEventListener('ended', () => {
    if (comparisonPlayback?.candidateId !== candidate.id) return;
    comparisonPlayback = { referenceId: reference.id, candidateId: candidate.id, phase: 'candidate' };
    render();
    requestAnimationFrame(() => {
      const next = document.querySelector<HTMLAudioElement>(`audio[data-audio-id="${candidate.id}"]`);
      if (!next) return finish();
      next.addEventListener('ended', finish, { once: true });
      void next.play().catch(() => { notice = 'Playback was blocked. Use the audio controls to listen.'; finish(); });
    });
  }, { once: true });
  try {
    await approvedAudio.play();
  } catch {
    notice = 'Playback was blocked. Use the audio controls to listen.';
    comparisonPlayback = null;
    render();
  }
}

async function updateField(input: HTMLInputElement) {
  const take = takes.find((item) => item.id === input.dataset.id);
  if (!take) return;
  if (input.dataset.field === 'note') take.note = input.value.trim();
  if (input.dataset.field === 'line') {
    take.line = input.value.trim() || 'Untitled line';
    selectedLine = take.line;
    if (take.reference && takes.some((item) => item.id !== take.id && item.line === take.line && item.reference)) take.reference = false;
  }
  await takeStore.put(take); notice = 'Saved locally.'; render();
}

async function restoreLicense(event: Event) {
  event.preventDefault();
  const token = document.querySelector<HTMLInputElement>('#license-token')?.value.trim();
  if (!token) return;
  licenseToken = token;
  licenseError = '';
  saveLicense(token);
  const submit = (event.target as HTMLFormElement).querySelector<HTMLButtonElement>('button');
  if (submit) { submit.disabled = true; submit.textContent = 'Verifying…'; }
  const verification = await verifyLicense(true);
  const valid = verification === 'valid';
  unlocked = valid;
  if (valid) { licenseToken = ''; document.querySelector<HTMLDialogElement>('#license-dialog')?.close(); notice = 'Studio restored on this device.'; render(); }
  else {
    if (verification === 'invalid') clearLicense();
    licenseError = verification === 'invalid'
      ? 'That license is not active. Check the token and try again.'
      : 'We could not verify this license right now. Reconnect and try again; Studio stays locked until it is verified.';
    render();
    const dialog = document.querySelector<HTMLDialogElement>('#license-dialog');
    dialog?.showModal();
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('#license-token')?.focus());
  }
}

function focusByKey(key: string) {
  const next = [...document.querySelectorAll<HTMLElement>('[data-focus-key]')].find((element) => element.dataset.focusKey === key);
  next?.focus({ preventScroll: true });
}

async function importBackup(file?: File) {
  if (!file) return;
  if (!unlocked) { document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal(); return; }
  try {
    const imported = await readBackup(await file.text());
    if (!confirm(`Import ${imported.length} takes? This adds them to the current board.`)) return;
    for (const take of imported) { take.id = crypto.randomUUID(); await takeStore.put(take); takes.push(take); }
    selectedLine = imported[0]?.line ?? selectedLine; notice = `${imported.length} takes restored from backup.`; render();
  } catch (cause) { error = cause instanceof Error ? cause.message : 'The backup could not be read.'; render(); }
}

function getObjectUrl(take: Take) {
  if (!urls.has(take.id) && take.blob) urls.set(take.id, URL.createObjectURL(take.blob));
  return urls.get(take.id) ?? '';
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { notice = 'Update ready. Reload to use it.'; render(); } });
    });
  }).catch(() => { /* The app remains usable without install support. */ });
}

window.addEventListener('online', () => render());
window.addEventListener('offline', () => { notice = 'You’re offline. Your saved board and analysis still work.'; render(); });

function setDemoMetadata() {
  document.title = 'Demo — Line Take Match';
  const description = 'Compare three sample dialogue takes in an isolated Line Take Match demo.';
  const canonical = 'https://line-take-match.sociobot.in/demo/';
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelectorAll<HTMLMetaElement>('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => meta.content = document.title);
  document.querySelectorAll<HTMLMetaElement>('meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => meta.content = description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
}

const dateStamp = () => new Date().toISOString().slice(0, 10);
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]!);
const escapeAttr = escapeHtml;
