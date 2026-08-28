import './styles.css';
import { analyzeFile } from './analysis';
import { takeStore } from './db';
import { download, makeBackup, readBackup, toCsv } from './export';
import { captureReturnedLicense, checkoutUrl, clearLicense, hasOptimisticUnlock, saveLicense, verifyLicense } from './license';
import { inferLineName, uniqueLines } from './naming';
import type { Metrics, Take } from './types';

const FREE_LIMIT = 12;
const app = document.querySelector<HTMLDivElement>('#app')!;
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

captureReturnedLicense();
unlocked = hasOptimisticUnlock();
void start();

async function start() {
  try {
    takes = await takeStore.all();
    takes.sort((a, b) => a.createdAt - b.createdAt);
    selectedLine = uniqueLines(takes)[0] ?? '';
  } catch {
    error = 'Your browser blocked local storage. Audio can be analyzed, but it will not survive a refresh.';
  } finally {
    loading = false;
    render();
  }
  if (localStorage.getItem('sb_license:line-take-match')) {
    const valid = await verifyLicense();
    if (valid !== unlocked) {
      unlocked = valid;
      notice = valid ? 'Studio unlocked on this device.' : 'This license is no longer active. Free mode is still available.';
      render();
    }
  }
  registerServiceWorker();
}

function render() {
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
      <div class="header-actions">
        <span class="network-pill" id="network-state"><span aria-hidden="true">●</span> ${navigator.onLine ? 'Local mode' : 'Offline · ready'}</span>
        <button class="button quiet" data-action="show-license">${unlocked ? 'Studio unlocked' : 'Unlock studio'}</button>
      </div>
    </header>
    <main id="main">
      <section class="hero ${takes.length ? 'hero-compact' : ''}" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">Private take comparison</p>
          <h1 id="page-title">Hear the line.<br><em>See the drift.</em></h1>
          <p class="lede">Match level, pace, pauses, and pitch movement against the take your performer approved. Nothing is uploaded. Nothing is cloned.</p>
          <div class="trust-strip" aria-label="Privacy summary"><span>On-device analysis</span><span>Creator-owned audio</span><span>Review cues, not scores</span></div>
        </div>
        <picture class="hero-art">
          <source srcset="/assets/hero-night-booth.webp" type="image/webp">
          <img src="/assets/hero-night-booth.webp" width="768" height="512" fetchpriority="high" alt="An empty voice booth glowing behind a rain-soaked night-market window, with a microphone and waveform-shaped paper strips">
        </picture>
      </section>

      <section class="import-panel" aria-labelledby="import-title">
        <div>
          <p class="section-kicker">01 / Bring your takes</p>
          <h2 id="import-title">Drop in a session</h2>
          <p>WAV, MP3, M4A, OGG, or FLAC. Names like <code>door-warning_take-03.wav</code> group automatically.</p>
        </div>
        <label class="consent-check"><input id="consent" type="checkbox" ${consent ? 'checked' : ''}><span>I have the performer’s consent and rights to review these recordings.</span></label>
        <label class="drop-zone ${processing ? 'is-processing' : ''}" id="drop-zone" tabindex="0">
          <input id="audio-files" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac" multiple ${processing ? 'disabled' : ''}>
          <span class="drop-icon" aria-hidden="true">↳</span>
          <strong>${processing || 'Choose audio or drop files here'}</strong>
          <span>${unlocked ? 'Unlimited studio board' : `${freeRemaining} of ${FREE_LIMIT} free slots remain`}</span>
        </label>
        ${error ? `<p class="message error" role="alert">${escapeHtml(error)}</p>` : ''}
      </section>

      ${loading ? loadingMarkup() : takes.length ? boardMarkup(visibleLines, current, reference, flagged) : emptyMarkup()}
      ${licenseMarkup()}
    </main>
    <footer><p>Built for human direction, not voice imitation. Hero scene is original AI-generated artwork.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></footer>
    <div class="toast ${notice ? 'is-visible' : ''}" role="status" aria-live="polite">${escapeHtml(notice)} ${undoTake ? '<button data-action="undo">Undo</button>' : ''}</div>
  `;
  bindEvents();
  clearTimeout(noticeTimer);
  if (notice && !undoTake) {
    noticeTimer = window.setTimeout(() => { notice = ''; render(); }, 5000);
  }
}

function loadingMarkup() {
  return `<section class="state-panel" aria-live="polite"><span class="meter" aria-hidden="true"></span><h2>Opening your local takeboard…</h2></section>`;
}

function emptyMarkup() {
  return `<section class="empty-state" aria-labelledby="empty-title"><div class="signal-glyph" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><p class="section-kicker">02 / Compare</p><h2 id="empty-title">Your cue sheet is quiet</h2><p>Import two or more takes of a line. Pick the approved performance as reference, then use the measurement differences to guide a human listen.</p><ol><li>Group takes by filename</li><li>Choose an approved reference</li><li>Flag mismatches and export the handoff</li></ol></div></section>`;
}

function boardMarkup(lines: string[], current: Take[], reference: Take | undefined, flagged: number) {
  return `<section class="board" aria-labelledby="board-title">
    <div class="board-heading"><div><p class="section-kicker">02 / Compare</p><h2 id="board-title">Takeboard</h2></div><div class="summary"><span><b>${uniqueLines(takes).length}</b> lines</span><span><b>${takes.length}</b> takes</span><span><b>${flagged}</b> flagged</span></div></div>
    <div class="board-tools">
      <label class="search"><span>Find a line</span><input id="search" type="search" value="${escapeAttr(search)}" placeholder="Search line names"></label>
      <div class="export-actions"><button class="button secondary" data-action="import-backup">Import backup</button><input id="backup-file" type="file" accept="application/json,.json" hidden><button class="button secondary" data-action="backup" ${unlocked ? '' : 'aria-describedby="backup-lock"'}>Back up project${unlocked ? '' : ' · Studio'}</button><button class="button primary" data-action="csv">Export CSV</button></div>
    </div>
    <div class="board-grid">
      <aside class="line-list" aria-label="Dialogue lines"><div class="line-list-label">Dialogue lines <span>${lines.length}</span></div>${lines.length ? lines.map(lineButton).join('') : '<p class="no-results">No lines match that search.</p>'}</aside>
      <div class="take-area">
        ${selectedLine ? `<div class="line-heading"><div><p>Selected line</p><h3>${escapeHtml(selectedLine)}</h3></div><span>${current.length} take${current.length === 1 ? '' : 's'}</span></div>
        <p class="cue-note"><span aria-hidden="true">◎</span>${reference ? `Differences are relative to “${escapeHtml(reference.name)}”. Listen before you decide.` : 'Set one approved take as the reference to reveal differences.'}</p>
        <div class="measure-legend" aria-hidden="true"><span>Take & waveform</span><span>Level</span><span>Pace</span><span>Pauses</span><span>Pitch range</span><span>Actions</span></div>
        <div class="takes">${current.map((take) => takeMarkup(take, reference)).join('')}</div>` : ''}
      </div>
    </div>
    <p id="backup-lock" class="visually-hidden">Project backup is included with the one-time Studio unlock. CSV export remains free.</p>
  </section>`;
}

function lineButton(line: string) {
  const lineTakes = takes.filter((take) => take.line === line);
  const flagged = lineTakes.filter((take) => take.flagged).length;
  return `<button class="line-button ${line === selectedLine ? 'active' : ''}" data-line="${escapeAttr(line)}" aria-current="${line === selectedLine ? 'true' : 'false'}"><span>${escapeHtml(line)}</span><small>${lineTakes.length} takes${flagged ? ` · ⚑ ${flagged}` : ''}</small></button>`;
}

function takeMarkup(take: Take, reference?: Take) {
  const metrics = take.metrics;
  const objectUrl = take.blob ? getObjectUrl(take) : '';
  const flaggedCues = reference && reference.id !== take.id ? reviewCueCount(metrics, reference.metrics) : 0;
  return `<article class="take-card ${take.reference ? 'is-reference' : ''} ${take.flagged ? 'is-flagged' : ''}">
    <div class="take-identity">
      <div class="take-label"><span>${take.reference ? 'Approved reference' : take.flagged ? 'Flagged for review' : flaggedCues ? `${flaggedCues} measurement cue${flaggedCues > 1 ? 's' : ''}` : 'Take'}</span><strong>${escapeHtml(take.name)}</strong></div>
      ${objectUrl ? `<audio controls preload="none" src="${objectUrl}" aria-label="Play ${escapeAttr(take.name)}"></audio>` : '<p class="missing-audio">Audio missing from imported backup</p>'}
      ${waveform(metrics, take.name)}
      <label class="line-field"><span>Line group</span><input data-field="line" data-id="${take.id}" value="${escapeAttr(take.line)}"></label>
    </div>
    ${metricCell('Level', `${metrics.loudness.toFixed(1)} dBFS`, delta(metrics.loudness, reference?.metrics.loudness, ' dB', false), Math.min(100, Math.max(4, (metrics.loudness + 60) * 2.1)))}
    ${metricCell('Pace', `${metrics.duration.toFixed(2)} s`, delta(metrics.duration, reference?.metrics.duration, ' s'), Math.min(100, metrics.duration / Math.max(...takes.filter(t => t.line === take.line).map(t => t.metrics.duration)) * 100))}
    ${metricCell('Pauses', `${Math.round(metrics.pauseRatio * 100)}%`, delta(metrics.pauseRatio * 100, reference ? reference.metrics.pauseRatio * 100 : undefined, ' pts'), metrics.pauseRatio * 100)}
    ${metricCell('Pitch range', metrics.pitchRange == null ? '—' : `${metrics.pitchRange.toFixed(1)} st`, metrics.pitchRange == null ? 'No stable pitch found' : delta(metrics.pitchRange, reference?.metrics.pitchRange ?? undefined, ' st'), Math.min(100, (metrics.pitchRange ?? 0) * 8))}
    <div class="take-actions">
      <button class="chip ${take.reference ? 'active' : ''}" data-action="reference" data-id="${take.id}" ${take.reference ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${take.reference ? '✓ Reference' : 'Set reference'}</button>
      <button class="chip ${take.flagged ? 'warning' : ''}" data-action="flag" data-id="${take.id}" aria-pressed="${take.flagged}">${take.flagged ? '⚑ Flagged' : 'Flag review'}</button>
      <label class="note-field"><span>Handoff note</span><input data-field="note" data-id="${take.id}" value="${escapeAttr(take.note)}" placeholder="Direction note"></label>
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
  if (reference == null) return 'Choose reference';
  const difference = percent && reference ? ((value - reference) / reference) * 100 : value - reference;
  if (Math.abs(difference) < 0.05) return 'Matches reference';
  return `${difference > 0 ? '+' : ''}${difference.toFixed(1)}${percent ? '%' : suffix} vs ref`;
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
  return `<dialog id="license-dialog" class="license-dialog"><button class="dialog-close" data-action="close-license" aria-label="Close unlock panel">×</button><p class="section-kicker">Studio unlock</p><h2>${unlocked ? 'Your full board is open' : 'Keep the whole session together'}</h2><p>Free mode compares up to ${FREE_LIMIT} takes and always includes CSV export. A <strong>$19 one-time purchase</strong> adds unlimited takes and portable project backups. No subscription.</p><ul><li>Unlimited local takes and lines</li><li>Audio-inclusive JSON project backup</li><li>Core comparison and CSV stay free</li></ul>${unlocked ? '<p class="message success">License active on this device.</p><button class="button quiet" data-action="clear-license">Remove license from device</button>' : `<a class="button primary buy" href="${checkoutUrl}">Buy Studio — $19 once</a><form id="license-form"><label><span>Have a license? Paste it here</span><input id="license-token" required autocomplete="off" spellcheck="false"></label><button class="button secondary" type="submit">Verify and restore</button></form>`}<p class="legal-note">Sociobot/Dodo is the merchant of record. Refunds are handled there and revoke the license. See <a href="/privacy/">privacy</a> and <a href="/terms/">terms</a>.</p></dialog>`;
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
  document.querySelectorAll<HTMLElement>('[data-line]').forEach((element) => element.addEventListener('click', () => { selectedLine = element.dataset.line ?? ''; render(); }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', () => void handleAction(element.dataset.action ?? '', element.dataset.id, element)));
  document.querySelectorAll<HTMLInputElement>('[data-field]').forEach((element) => element.addEventListener('change', () => void updateField(element)));
  document.querySelector('#license-form')?.addEventListener('submit', (event) => void restoreLicense(event));
  document.querySelector('#backup-file')?.addEventListener('change', (event) => void importBackup((event.target as HTMLInputElement).files?.[0]));
}

async function addFiles(fileList: FileList | null) {
  error = '';
  const files = [...(fileList ?? [])].filter((file) => file.type.startsWith('audio/') || /\.(wav|mp3|m4a|ogg|flac)$/i.test(file.name));
  if (!files.length) { error = 'No supported audio files were selected.'; render(); return; }
  if (!consent) { error = 'Confirm performer consent and recording rights before importing audio.'; render(); return; }
  if (!unlocked && takes.length + files.length > FREE_LIMIT) {
    error = `Free mode holds ${FREE_LIMIT} takes. Select fewer files or unlock Studio for the full session.`;
    render();
    document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal();
    return;
  }
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
    } catch (cause) {
      error = `${file.name}: ${cause instanceof Error ? cause.message : 'Analysis failed.'}`;
    }
  }
  processing = '';
  notice = `${files.length} file${files.length === 1 ? '' : 's'} processed locally.`;
  render();
}

async function handleAction(action: string, id?: string, source?: HTMLElement) {
  if (action === 'show-license') { document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal(); return; }
  if (action === 'close-license') { document.querySelector<HTMLDialogElement>('#license-dialog')?.close(); return; }
  if (action === 'csv') { download(toCsv(takes), `line-take-match-${dateStamp()}.csv`, 'text/csv;charset=utf-8'); notice = 'Handoff CSV exported.'; render(); return; }
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
    notice = `${take.name} is now the reference.`;
  } else if (action === 'flag') {
    take.flagged = !take.flagged; await takeStore.put(take); notice = take.flagged ? 'Take flagged for the handoff.' : 'Review flag removed.';
  } else if (action === 'remove') {
    if (!confirm(`Remove “${take.name}” from this device? You can undo for 8 seconds.`)) return;
    takes = takes.filter((item) => item.id !== take.id); await takeStore.remove(take.id); undoTake = take; notice = `${take.name} removed.`;
    undoTimer = window.setTimeout(() => { undoTake = null; notice = ''; render(); }, 8000);
  }
  source?.blur(); render();
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
  saveLicense(token);
  const submit = (event.target as HTMLFormElement).querySelector<HTMLButtonElement>('button');
  if (submit) { submit.disabled = true; submit.textContent = 'Verifying…'; }
  const valid = await verifyLicense(true);
  unlocked = valid;
  if (valid) { document.querySelector<HTMLDialogElement>('#license-dialog')?.close(); notice = 'Studio restored on this device.'; render(); }
  else { clearLicense(); error = 'That license could not be verified. Check the token and try again.'; render(); document.querySelector<HTMLDialogElement>('#license-dialog')?.showModal(); }
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

const dateStamp = () => new Date().toISOString().slice(0, 10);
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]!);
const escapeAttr = escapeHtml;
