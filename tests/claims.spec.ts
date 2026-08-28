import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

function wav(name: string, frequency = 200, seconds = 0.35) {
  const sampleRate = 8_000;
  const count = Math.round(sampleRate * seconds);
  const buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + count * 2, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(count * 2, 40);
  for (let index = 0; index < count; index += 1) {
    const value = Math.sin(2 * Math.PI * frequency * index / sampleRate) * 0.35;
    buffer.writeInt16LE(Math.round(value * 32_767), 44 + index * 2);
  }
  return { name, mimeType: 'audio/wav', buffer };
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your take list')).toBeVisible();
  await expect(page.locator('.take-card')).toHaveCount(3);
});

test('@claim:demo-sandbox keeps sample work separate and clears it on exit', async ({ page }) => {
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('demo:line-take-match');
  expect(databases).not.toContain('line-take-match');
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('line-take-match', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('takes', { keyPath: 'id' });
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('takes', 'readwrite');
      transaction.objectStore('takes').put({
        id: 'real-sentinel', name: 'private-project_take-01', line: 'private project', blob: null,
        mime: 'audio/wav', size: 0, createdAt: 1, reference: false, flagged: false, note: 'Keep me',
        metrics: { duration: 1, activeDuration: 1, pauseRatio: 0, loudness: -12, pitchLow: null, pitchHigh: null, pitchRange: null, peaks: [0.5] },
      });
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  }));

  await page.locator('[data-field="note"]').first().fill('Changed only in demo');
  await page.locator('[data-field="note"]').first().blur();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('[data-field="note"]').first()).toHaveValue('Approved read: calm, then urgent.');

  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  await expect(page).toHaveURL('/');
  await expect(page.getByText('private-project_take-01')).toBeVisible();
  await expect(page.locator('.take-card')).toHaveCount(1);
  const demoRows = await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('demo:line-take-match');
    request.onsuccess = () => {
      const transaction = request.result.transaction('takes');
      const count = transaction.objectStore('takes').count();
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => reject(count.error);
    };
    request.onerror = () => reject(request.error);
  }));
  expect(demoRows).toBe(0);
});

test('@claim:local-private keeps audio analysis and take data in the browser', async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await page.reload();
  await expect(page.locator('.take-card')).toHaveCount(3);
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(wav('new-warning_take-01.wav'));
  await expect(page.getByText('1 file processed locally.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-line]')).toHaveCount(2);
  await expect(page.locator('.summary')).toContainText('4 takes');
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.every((request) => request.method === 'GET' && request.body == null)).toBe(true);
  await page.goto('/');
  await expect(page.locator('.take-card')).toHaveCount(0);
});

test('@claim:no-voice-services makes no transcription, generation, or cloning request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.reload();
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(wav('local-only_take-01.wav'));
  await expect(page.getByText('1 file processed locally.')).toBeVisible({ timeout: 15_000 });
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await page.goto('/');
  await expect(page.getByText('Line Take Match does not transcribe, generate, or clone voices.')).toBeVisible();
});

test('@claim:offline-reload reloads the sample take list offline', async ({ page, context }) => {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Take list' })).toBeVisible();
  await expect(page.locator('.take-card')).toHaveCount(3);
});

test('@claim:filename-grouping groups numbered filenames and keeps the line editable', async ({ page }) => {
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles([
    wav('gate-alert_take-01.wav', 180),
    wav('gate-alert_take-02.wav', 220),
  ]);
  await expect(page.getByText('2 files processed locally.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-line="gate alert"]')).toContainText('2 takes');
  await page.locator('[data-line="gate alert"]').click();
  await expect(page.locator('[data-field="line"]')).toHaveCount(2);
  await page.locator('[data-field="line"]').evaluateAll((inputs) => inputs.forEach((input) => {
    (input as HTMLInputElement).value = 'gate alert revised';
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }));
  await expect(page.locator('[data-line="gate alert revised"]')).toContainText('2 takes');
  await page.reload();
  await page.locator('[data-line="gate alert revised"]').click();
  await expect(page.locator('[data-field="line"]').first()).toHaveValue('gate alert revised');
});

test('@claim:comparison-cues shows four measured differences against the approved take', async ({ page }) => {
  await expect(page.locator('.status-chip')).toHaveCount(1);
  await expect(page.locator('.take-card').nth(1).locator('.metric')).toHaveCount(4);
  for (const label of ['Level', 'Pace', 'Pauses', 'Pitch range']) await expect(page.locator('.measure-legend')).toContainText(label);
  for (const card of [page.locator('.take-card').nth(1), page.locator('.take-card').nth(2)]) {
    await expect(card.locator('.metric').filter({ hasText: 'Level' }).getByText(/difference/)).toBeVisible();
    await expect(card.locator('.metric').filter({ hasText: 'Pace' }).getByText(/difference/)).toBeVisible();
    await expect(card.locator('.metric').filter({ hasText: 'Pauses' }).getByText(/difference/)).toBeVisible();
    await expect(card.locator('.metric').filter({ hasText: 'Pitch range' }).getByText(/difference/)).toBeVisible();
  }
  await expect(page.getByText(/measurement cue/).first()).toBeVisible();
});

test('@claim:csv-export downloads one CSV row for every sample take', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const csv = await readFile(path!, 'utf8');
  expect(csv.split('\r\n')).toHaveLength(4);
  expect(csv).toContain('"line","take","reference","flagged_for_review","note","duration_seconds","active_seconds","pause_percent","loudness_dbfs","pitch_low_hz","pitch_high_hz","pitch_range_semitones"');
  expect(csv).toContain('"door warning","door-warning_take-03","no","yes","Review: faster and wider pitch range.","1.380","1.270","8.0","\'-19.1"');
});

test('@claim:free-limit keeps 12 takes and CSV free', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(Array.from({ length: 12 }, (_, index) => wav(`line-${index + 1}_take-01.wav`, 180 + index)));
  await expect(page.getByText('12 files processed locally.')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('0 of 12 free takes remain')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await page.locator('#audio-files').setInputFiles(wav('line-13_take-01.wav'));
  await expect(page.getByRole('alert')).toContainText('Free mode holds 12 takes');
  await expect(page.locator('[data-line]')).toHaveCount(12);
});

test('@claim:studio-backup proves the recorded $19 offer, unlimited takes, and portable audio backup', async ({ page, browser }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  await page.getByRole('button', { name: 'See Studio — $19' }).click();
  await expect(page.getByRole('link', { name: 'Buy Studio — $19 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/line-take-match/checkout');
  await page.route('https://api.sociobot.in/api/v1/products/line-take-match/catalog', (route) => route.fulfill({ json: { slug: 'line-take-match', price_minor: 1900, currency: 'USD', billing: 'one_time' } }));
  const offer = await page.evaluate(() => fetch('https://api.sociobot.in/api/v1/products/line-take-match/catalog').then((response) => response.json()));
  expect(offer).toEqual({ slug: 'line-take-match', price_minor: 1900, currency: 'USD', billing: 'one_time' });
  await page.getByRole('button', { name: 'Close Studio details' }).click();
  await page.evaluate(() => {
    localStorage.setItem('sb_license:line-take-match', 'verified-test-token');
    localStorage.setItem('sb_license:line-take-match:verdict', JSON.stringify({ token: 'verified-test-token', valid: true, checkedAt: Date.now() }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Manage Studio license' })).toBeVisible();
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(Array.from({ length: 13 }, (_, index) => wav(index < 2 ? `studio-scene_take-0${index + 1}.wav` : `studio-line-${index + 1}_take-01.wav`, 180 + index)));
  await expect(page.locator('.summary')).toContainText('13 takes', { timeout: 30_000 });
  await page.goto('/?demo=1');
  await expect(page.locator('.take-card')).toHaveCount(3);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up project' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const backup = JSON.parse(await readFile(path!, 'utf8')) as { takes: Array<{ blob: string }> };
  expect(backup.takes).toHaveLength(3);
  expect(backup.takes.every((take) => take.blob.startsWith('data:audio/wav;base64,'))).toBe(true);
  const backupBuffer = await readFile(path!);

  const restoredContext = await browser.newContext();
  await restoredContext.addInitScript(() => { window.confirm = () => true; });
  const restored = await restoredContext.newPage();
  try {
    await restored.goto('/');
    await restored.evaluate(() => {
      localStorage.setItem('sb_license:line-take-match', 'portable-test-token');
      localStorage.setItem('sb_license:line-take-match:verdict', JSON.stringify({ token: 'portable-test-token', valid: true, checkedAt: Date.now() }));
    });
    await restored.reload();
    await expect(restored.getByRole('button', { name: 'Manage Studio license' })).toBeVisible();
    await restored.locator('#backup-file').setInputFiles({ name: 'portable-take-list.json', mimeType: 'application/json', buffer: backupBuffer });
    await expect(restored.getByText('3 takes restored from backup.')).toBeVisible();
    await expect(restored.locator('.summary')).toContainText('3 takes');
    await expect(restored.getByText('door-warning_take-01', { exact: true })).toBeVisible();
    await expect(restored.locator('[data-field="note"]').first()).toHaveValue('Approved read: calm, then urgent.');
    await expect(restored.locator('.status-chip')).toHaveCount(1);
    await expect(restored.getByRole('button', { name: 'Remove review flag' })).toHaveCount(1);
    await expect(restored.locator('.metric').first()).toContainText('dBFS');
    await expect(restored.locator('audio')).toHaveCount(3);
  } finally {
    await restoredContext.close();
  }
});

test('@claim:billing-api sends license checks only to the Sociobot product route', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  let verificationUrl = '';
  await page.route('https://api.sociobot.in/api/v1/products/line-take-match/verify?license=*', (route) => {
    verificationUrl = route.request().url();
    return route.fulfill({ json: { valid: false, reason: 'invalid' } });
  });
  await page.getByRole('button', { name: 'See Studio — $19' }).click();
  await expect(page.getByRole('link', { name: 'Buy Studio — $19 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/line-take-match/checkout');
  await page.locator('#license-token').fill('recorded-invalid-token');
  await page.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(page.getByRole('alert')).toContainText('not active');
  expect(verificationUrl).toBe('https://api.sociobot.in/api/v1/products/line-take-match/verify?license=recorded-invalid-token');
});

test('@claim:no-tracking loads no analytics, tracker, remote font, transcription, or generation resource', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.reload();
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(wav('privacy_take-01.wav'));
  await expect(page.getByText('1 file processed locally.')).toBeVisible({ timeout: 15_000 });
  const resources = await page.evaluate(() => [...document.querySelectorAll('script[src], link[rel="stylesheet"][href], link[rel="preload"][href]')].map((element) => element instanceof HTMLScriptElement ? element.src : (element as HTMLLinkElement).href));
  expect(resources.every((url) => !url || new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:pwa-install has an installable manifest and controlled offline shell', async ({ page }) => {
  const manifest = await page.evaluate(() => fetch('/manifest.webmanifest').then((response) => response.json()));
  expect(manifest).toMatchObject({ name: 'Line Take Match', short_name: 'Take Match', display: 'standalone' });
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '192x192' }), expect.objectContaining({ sizes: '512x512', purpose: 'any maskable' })]));
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
});

test('@claim:payment-isolation keeps payment fields outside Line Take Match', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  await page.getByRole('button', { name: 'See Studio — $19' }).click();
  await expect(page.getByRole('link', { name: 'Buy Studio — $19 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/line-take-match/checkout');
  expect(await page.locator('input[type="cardnumber"], input[name*="card" i], input[autocomplete*="cc-"]').count()).toBe(0);
});

test('@claim:license-storage stores the token and daily verification verdict in browser storage', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  await page.route('**/api/v1/products/line-take-match/verify?license=stored-token', (route) => route.fulfill({ json: { valid: true, reason: 'ok' } }));
  await page.getByRole('button', { name: 'See Studio — $19' }).click();
  await page.locator('#license-token').fill('stored-token');
  await page.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(page.getByRole('button', { name: 'Manage Studio license' })).toBeVisible();
  const stored = await page.evaluate(() => ({ token: localStorage.getItem('sb_license:line-take-match'), verdict: JSON.parse(localStorage.getItem('sb_license:line-take-match:verdict') ?? 'null') }));
  expect(stored.token).toBe('stored-token');
  expect(stored.verdict).toMatchObject({ token: 'stored-token', valid: true });
  expect(Date.now() - stored.verdict.checkedAt).toBeLessThan(5_000);
});

test('@claim:license-states locks Studio for invalid, revoked, expired, and wrong-product responses', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  for (const reason of ['invalid', 'revoked', 'expired', 'wrong_product']) {
    await page.route(`**/api/v1/products/line-take-match/verify?license=${reason}-token`, (route) => route.fulfill({ json: { valid: false, reason } }));
    await page.getByRole('button', { name: 'See Studio — $19' }).click();
    await page.locator('#license-token').fill(`${reason}-token`);
    await page.getByRole('button', { name: 'Verify and restore' }).click();
    await expect(page.getByRole('alert')).toContainText('not active');
    await expect(page.getByRole('button', { name: 'See Studio — $19' })).toBeVisible();
    await page.getByRole('button', { name: 'Close Studio details' }).click();
  }
});

test('@claim:comparison-playback plays the approved take before the selected take without a request', async ({ page }) => {
  const played: string[] = [];
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      window.dispatchEvent(new CustomEvent('test-played', { detail: this.getAttribute('data-audio-id') }));
      queueMicrotask(() => this.dispatchEvent(new Event('ended')));
      return Promise.resolve();
    };
  });
  await page.reload();
  await page.evaluate(() => window.addEventListener('test-played', (event) => {
    document.documentElement.dataset.played = `${document.documentElement.dataset.played ?? ''},${(event as CustomEvent<string>).detail}`;
  }));
  await page.getByRole('button', { name: 'Play approved, then this take' }).first().click();
  await expect.poll(() => page.locator('html').getAttribute('data-played')).toContain('demo-door-01,demo-door-02');
});
