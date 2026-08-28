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
    await Promise.all(['line-take-match', 'demo:line-take-match'].map((name) => new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve();
    })));
    localStorage.clear();
  });
  await page.reload();
});

test('states the job, audience, next step, and demo action in the first mobile viewport', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Compare voice takes with an approved take.' })).toBeVisible();
  await expect(page.getByText('For indie animators and game creators checking whether recorded character lines match.')).toBeVisible();
  const demo = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(demo).toBeVisible();
  const box = await demo.boundingBox();
  expect(box && box.y + box.height).toBeLessThanOrEqual(844);
});

test('shows a working sample comparison in the first demo viewport', async ({ page }) => {
  await page.goto('/?demo=1');
  const proof = page.getByRole('complementary', { name: 'Sample comparison' });
  await expect(proof.getByText('door-warning_take-01')).toBeVisible();
  await expect(proof.getByText('door-warning_take-02')).toBeVisible();
  await expect(proof.getByText(/dB difference/)).toBeVisible();
  await expect(proof.getByRole('button', { name: 'Play approved, then this take' })).toBeVisible();
  const box = await proof.boundingBox();
  expect(box && box.y + box.height).toBeLessThanOrEqual(844);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload();
  const desktopBox = await page.getByRole('complementary', { name: 'Sample comparison' }).boundingBox();
  expect(desktopBox && desktopBox.y + desktopBox.height).toBeLessThanOrEqual(800);
});

test('moves focus to main content from the skip link', async ({ page }) => {
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('serves route-specific metadata and the designed not-found page', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page).toHaveTitle('Demo — Line Take Match');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://line-take-match.sociobot.in/demo/');
  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy — Line Take Match');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.jpg$/);
  await page.goto('/404/');
  await expect(page).toHaveTitle('Page not found — Line Take Match');
  await expect(page.getByRole('heading', { level: 1, name: 'This page missed its cue.' })).toBeVisible();
});

test('moves focus to the route heading and announces internal navigation and browser back', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-announcement')).toContainText('Privacy — Line Take Match');
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#route-announcement')).toContainText('Line Take Match — compare recorded voice takes');
});

test('restores a heading destination through demo, terms, and not-found history entries', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Demo' }).click();
  await expect(page).toHaveURL(/demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();

  await page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'Terms' }).click();
  await expect(page).toHaveURL(/\/terms\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();

  await page.goto('/404/');
  await page.getByRole('link', { name: 'Return to Line Take Match' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('imports, compares, flags, persists, and works offline', async ({ page, context }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByText('Your takes will appear here')).toBeVisible();
  await page.locator('#consent').check();
  await page.locator('#audio-files').setInputFiles([
    wav('door-warning_take-01.wav', 180, 1),
    wav('door-warning_take-02.wav', 240, 1.3),
  ]);
  await expect(page.getByText('2 files processed locally.')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.take-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Set as approved' }).first().click();
  await expect(page.locator('.status-chip')).toHaveCount(1);
  await page.getByRole('button', { name: 'Flag review' }).last().click();
  await expect(page.getByText('Take flagged for review.')).toBeVisible();
  await page.reload();
  await expect(page.locator('.take-card')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Remove review flag' })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Take list', exact: true })).toBeVisible();
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

  const reference = page.getByRole('button', { name: 'Set as approved' }).first();
  await reference.focus();
  await reference.press('Enter');
  await expect(page.locator('.status-chip').first()).toBeFocused();

  const flag = page.getByRole('button', { name: 'Flag review' }).first();
  await flag.focus();
  await flag.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove review flag' }).first()).toBeFocused();

  const nextLine = page.locator('[data-line="window"]');
  await nextLine.focus();
  await nextLine.press('Enter');
  await expect(page.locator('[data-line="window"]')).toBeFocused();
});

test('keeps an unverified license locked and explains an invalid token inside the dialog', async ({ page }) => {
  await page.route('**/api/v1/products/line-take-match/verify?license=*', (route) => route.abort());
  await page.getByRole('button', { name: 'See Studio — $19' }).click();
  const dialog = page.locator('#license-dialog');
  await dialog.locator('#license-token').fill('never-verified');
  await dialog.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Studio stays locked until it is verified.');
  await expect(page.getByRole('button', { name: 'See Studio — $19' })).toBeVisible();

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

  await expect(page.getByRole('button', { name: 'Manage Studio license' })).toBeVisible();
  await expect(page).not.toHaveURL(/license=/);
  await expect(page).toHaveURL(/campaign=summer/);
});

test('provides 44px home and legal link targets', async ({ page }) => {
  const homeBox = await page.getByRole('link', { name: 'Line Take Match home' }).boundingBox();
  expect(homeBox?.width).toBeGreaterThanOrEqual(44);
  expect(homeBox?.height).toBeGreaterThanOrEqual(44);

  await page.goto('/terms/');
  const privacyBox = await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' }).boundingBox();
  expect(privacyBox?.width).toBeGreaterThanOrEqual(44);
  expect(privacyBox?.height).toBeGreaterThanOrEqual(44);
});

test('has no serious accessibility issues, console errors, or mobile overflow on public routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const route of ['/', '/?demo=1', '/privacy/', '/terms/', '/404/']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
