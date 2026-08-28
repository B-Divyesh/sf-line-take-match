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
