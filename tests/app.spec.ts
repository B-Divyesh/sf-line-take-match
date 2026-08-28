import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function wav(name: string, frequency: number, seconds: number) {
  const sampleRate = 8_000;
  const count = sampleRate * seconds;
  const buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + count * 2, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(count * 2, 40);
  for (let index = 0; index < count; index += 1) {
    const silent = index < sampleRate * 0.1 || index > count - sampleRate * 0.1;
    const value = silent ? 0 : Math.sin(2 * Math.PI * frequency * index / sampleRate) * 0.45;
    buffer.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
  }
  return { name, mimeType: 'audio/wav', buffer };
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    indexedDB.deleteDatabase('line-take-match');
    localStorage.clear();
  });
  await page.reload();
});

test('imports, compares, flags, persists, and works offline', async ({ page, context }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText('Your cue sheet is quiet')).toBeVisible();
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles([
    wav('door-warning_take-01.wav', 180, 1),
    wav('door-warning_take-02.wav', 240, 1.3),
  ]);
  await expect(page.getByText('2 files processed locally.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.take-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Set reference' }).first().click();
  await expect(page.getByText('Approved reference')).toBeVisible();
  await page.getByRole('button', { name: 'Flag review' }).last().click();
  await expect(page.getByText('Take flagged for the handoff.')).toBeVisible();
  await page.reload();
  await expect(page.locator('.take-card')).toHaveCount(2);
  await expect(page.getByRole('button', { name: '⚑ Flagged' })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Takeboard' })).toBeVisible();
  await expect(page.locator('.take-card')).toHaveCount(2);
});

test('blocks import until rights are confirmed', async ({ page }) => {
  await page.locator('#audio-files').setInputFiles(wav('line_take-1.wav', 200, 1));
  await expect(page.getByRole('alert')).toContainText('Confirm performer consent');
  await expect(page.locator('.take-card')).toHaveCount(0);
});

test('reports mixed import results without overstating the successful takes', async ({ page }) => {
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles([
    wav('good_take-1.wav', 200, 1),
    { name: 'broken_take-2.wav', mimeType: 'audio/wav', buffer: Buffer.from('not a wave file') },
  ]);

  await expect(page.getByText('1 file processed locally; 1 file could not be analyzed.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.take-card')).toHaveCount(1);
  await expect(page.getByRole('alert')).toContainText('broken_take-2.wav');
});

test('keeps keyboard focus on the updated reference, flag, and line controls', async ({ page }) => {
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles([
    wav('door_take-1.wav', 180, 1),
    wav('window_take-1.wav', 240, 1),
  ]);
  await expect(page.locator('[data-line]')).toHaveCount(2, { timeout: 15_000 });
  await expect(page.locator('.take-card')).toHaveCount(1);

  const reference = page.getByRole('button', { name: 'Set reference' }).first();
  await reference.focus();
  await reference.press('Enter');
  await expect(page.getByRole('button', { name: '✓ Reference' }).first()).toBeFocused();

  const flag = page.getByRole('button', { name: 'Flag review' }).first();
  await flag.focus();
  await flag.press('Enter');
  await expect(page.getByRole('button', { name: '⚑ Flagged' }).first()).toBeFocused();

  const nextLine = page.locator('[data-line="window"]');
  await nextLine.focus();
  await nextLine.press('Enter');
  await expect(page.locator('[data-line="window"]')).toBeFocused();
});

test('keeps an unverified license locked and explains an invalid token inside the dialog', async ({ page }) => {
  await page.route('**/api/v1/products/line-take-match/verify?license=*', (route) => route.abort());
  await page.getByRole('button', { name: 'Unlock studio' }).click();
  const dialog = page.locator('#license-dialog');
  await dialog.locator('#license-token').fill('never-verified');
  await dialog.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Studio stays locked until it is verified.');
  await expect(page.getByRole('button', { name: 'Unlock studio' })).toBeVisible();

  await page.unrouteAll({ behavior: 'wait' });
  await page.route('**/api/v1/products/line-take-match/verify?license=*', (route) => route.fulfill({ json: { valid: false, reason: 'invalid' } }));
  await dialog.locator('#license-token').fill('invalid-token');
  await dialog.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(dialog.getByRole('alert')).toContainText('That license is not active.');
  await expect(dialog.locator('#license-token')).toHaveValue('invalid-token');
});

test('captures a verified checkout return token and removes it from the address bar', async ({ page }) => {
  await page.route('**/api/v1/products/line-take-match/verify?license=returned-token', (route) => route.fulfill({ json: { valid: true, reason: 'ok' } }));
  await page.goto('/?campaign=summer&license=returned-token');

  await expect(page.getByRole('button', { name: 'Studio unlocked' })).toBeVisible();
  await expect(page).not.toHaveURL(/license=/);
  await expect(page).toHaveURL(/campaign=summer/);
});

test('provides 44px home and legal link targets', async ({ page }) => {
  const homeBox = await page.getByRole('link', { name: 'Line Take Match home' }).boundingBox();
  expect(homeBox?.width).toBeGreaterThanOrEqual(44);
  expect(homeBox?.height).toBeGreaterThanOrEqual(44);

  await page.goto('/terms/');
  const privacyBox = await page.getByRole('link', { name: 'Privacy' }).boundingBox();
  expect(privacyBox?.width).toBeGreaterThanOrEqual(44);
  expect(privacyBox?.height).toBeGreaterThanOrEqual(44);
});
