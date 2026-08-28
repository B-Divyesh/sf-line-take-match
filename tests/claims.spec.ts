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

test('@claim:local-private @claim:no-voice-services analyzes without uploads or voice services', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(wav('new-warning_take-01.wav'));
  await expect(page.getByText('1 file processed locally.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-line]')).toHaveCount(2);
  await expect(page.locator('.summary')).toContainText('4 takes');
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await page.goto('/');
  await expect(page.locator('.take-card')).toHaveCount(0);
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
});

test('@claim:comparison-cues shows four measured differences against the approved take', async ({ page }) => {
  await expect(page.getByText('Approved take', { exact: true })).toBeVisible();
  await expect(page.locator('.take-card').nth(1).locator('.metric')).toHaveCount(4);
  await expect(page.locator('.measure-legend')).toContainText('Level');
  await expect(page.locator('.measure-legend')).toContainText('Pitch range');
  await expect(page.locator('.take-card').nth(1).getByText(/difference|Matches approved take/).first()).toBeVisible();
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
  expect(csv).toContain('"line","take","reference","flagged_for_review"');
  expect(csv).toContain('"door warning","door-warning_take-03","no","yes"');
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

test('@claim:studio-backup unlocks unlimited takes and exports audio in a project backup', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  await page.getByRole('button', { name: 'Studio — $19' }).click();
  await expect(page.getByRole('link', { name: 'Buy Studio — $19 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/line-take-match/checkout');
  await page.getByRole('button', { name: 'Close Studio details' }).click();
  await page.evaluate(() => {
    localStorage.setItem('sb_license:line-take-match', 'verified-test-token');
    localStorage.setItem('sb_license:line-take-match:verdict', JSON.stringify({ token: 'verified-test-token', valid: true, checkedAt: Date.now() }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Studio active' })).toBeVisible();
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles(Array.from({ length: 13 }, (_, index) => wav(`studio-line-${index + 1}_take-01.wav`, 180 + index)));
  await expect(page.locator('[data-line]')).toHaveCount(13, { timeout: 30_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up project' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const backup = JSON.parse(await readFile(path!, 'utf8')) as { takes: Array<{ blob: string }> };
  expect(backup.takes).toHaveLength(13);
  expect(backup.takes.every((take) => take.blob.startsWith('data:audio/wav;base64,'))).toBe(true);
});

test('@claim:billing-api sends license checks only to the Sociobot product route', async ({ page }) => {
  await Promise.all([page.waitForURL('/'), page.getByRole('button', { name: 'Start for real' }).click()]);
  let verificationUrl = '';
  await page.route('https://api.sociobot.in/api/v1/products/line-take-match/verify?license=*', (route) => {
    verificationUrl = route.request().url();
    return route.fulfill({ json: { valid: false, reason: 'invalid' } });
  });
  await page.getByRole('button', { name: 'Studio — $19' }).click();
  await expect(page.getByRole('link', { name: 'Buy Studio — $19 once' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/line-take-match/checkout');
  await page.locator('#license-token').fill('recorded-invalid-token');
  await page.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(page.getByRole('alert')).toContainText('not active');
  expect(verificationUrl).toBe('https://api.sociobot.in/api/v1/products/line-take-match/verify?license=recorded-invalid-token');
});
