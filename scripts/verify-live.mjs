import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.LIVE_BASE_URL ?? 'https://line-take-match.sociobot.in';
const evidence = new URL('../.factory/evidence/live/', import.meta.url);
await mkdir(evidence, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(String(error)));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function databaseRows(name) {
  return page.evaluate((databaseName) => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => request.result.createObjectStore('takes', { keyPath: 'id' });
    request.onsuccess = () => {
      const db = request.result;
      const rows = db.transaction('takes').objectStore('takes').getAll();
      rows.onerror = () => reject(rows.error);
      rows.onsuccess = () => { resolve(rows.result); db.close(); };
    };
  }), name);
}

const routeChecks = [];
try {
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  check(await page.title() === 'Line Take Match — compare recorded voice takes', 'Root title is wrong');
  check(await page.locator('h1').count() === 1, 'Root must have one h1');
  const demoAction = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  check(demoAction && demoAction.y + demoAction.height <= 844, 'Demo action is outside the first mobile viewport');
  check(await page.getByText('For indie animators and game creators', { exact: false }).isVisible(), 'Audience copy is missing');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Root overflows at 390px');
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused({ timeout: 1_000 });
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused({ timeout: 1_000 });
  await expect(page.locator('#route-announcement')).toHaveText('Privacy — Line Take Match.', { timeout: 1_000 });
  await page.goBack({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused({ timeout: 1_000 });

  await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('line-take-match', 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => request.result.createObjectStore('takes', { keyPath: 'id' });
    request.onsuccess = () => {
      const db = request.result;
      const sentinel = {
        id: 'live-real-sentinel', name: 'real-sentinel', line: 'real line', mime: 'audio/wav', size: 0,
        createdAt: 1, reference: true, flagged: false, note: 'Must survive demo',
        metrics: { duration: 1, activeDuration: 1, pauseRatio: 0, loudness: -18, pitchLow: 180, pitchHigh: 240, pitchRange: 5, peaks: [0.4, 0.7] },
      };
      const tx = db.transaction('takes', 'readwrite');
      tx.objectStore('takes').put(sentinel);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }));

  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  check(await page.title() === 'Demo — Line Take Match', 'Demo title is wrong');
  check(await page.getByText('Demo — sample data, nothing is saved', { exact: false }).isVisible(), 'Demo banner is missing');
  check(await page.locator('.take-card').count() === 3, 'Demo did not open three sample takes');
  const demoProof = page.getByRole('complementary', { name: 'Sample comparison' });
  check(await demoProof.getByText('door-warning_take-01').isVisible(), 'Demo proof does not show the approved sample');
  check(await demoProof.getByText('door-warning_take-02').isVisible(), 'Demo proof does not show a candidate sample');
  check(await demoProof.getByText(/dB difference/).isVisible(), 'Demo proof does not show a measured difference');
  check(await demoProof.getByRole('button', { name: 'Play approved, then this take' }).isVisible(), 'Demo proof has no comparison action');
  const demoProofBox = await demoProof.boundingBox();
  check(Boolean(demoProofBox && demoProofBox.y + demoProofBox.height <= 844), 'Demo proof is outside the first mobile viewport');
  check((await databaseRows('line-take-match')).some((row) => row.id === 'live-real-sentinel'), 'Demo read or erased real data');
  await page.locator('[data-field="note"]').first().fill('changed in live demo');
  await page.locator('[data-field="note"]').first().blur();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForFunction(() => document.querySelector('[data-field="note"]')?.value !== 'changed in live demo');
  check(await page.locator('[data-field="note"]').first().inputValue() !== 'changed in live demo', 'Demo reset did not restore samples');

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) location.reload();
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  check(await page.locator('.take-card').count() === 3, 'Demo did not reload offline');
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL(`${base}/`);
  check((await databaseRows('line-take-match')).some((row) => row.id === 'live-real-sentinel'), 'Leaving demo changed real data');
  check((await databaseRows('demo:line-take-match')).length === 0, 'Leaving demo did not clear demo data');

  for (const [path, title] of [
    ['/', 'Line Take Match — compare recorded voice takes'],
    ['/demo/', 'Demo — Line Take Match'],
    ['/privacy/', 'Privacy — Line Take Match'],
    ['/terms/', 'Terms — Line Take Match'],
    ['/not-a-real-page', 'Page not found — Line Take Match'],
  ]) {
    const errorsBeforeRoute = consoleErrors.length;
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    const expectedStatus = path === '/not-a-real-page' ? 404 : 200;
    check(response?.status() === expectedStatus, `${path} returned ${response?.status()}`);
    check(await page.title() === title, `${path} title is wrong`);
    check(await page.locator('h1').count() === 1, `${path} must have one h1`);
    check(Boolean(await page.locator('link[rel="canonical"]').getAttribute('href')), `${path} has no canonical URL`);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''));
    check(serious.length === 0, `${path} has serious accessibility violations`);
    if (path === '/not-a-real-page') {
      const expected404Errors = consoleErrors.splice(errorsBeforeRoute);
      check(expected404Errors.every((message) => message.includes('status of 404')), 'The not-found route logged an unexpected error');
    }
    routeChecks.push({ path, status: response.status(), title, seriousAxeViolations: 0 });
  }

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'See Studio details' }).click();
  check(await page.getByRole('link', { name: 'Buy Studio — $19 once' }).getAttribute('href') === 'https://api.sociobot.in/api/v1/products/line-take-match/checkout', 'Checkout link is wrong');
  await page.screenshot({ path: new URL('cold-mobile.png', evidence).pathname, fullPage: true });

  const checkout = await context.request.get('https://api.sociobot.in/api/v1/products/line-take-match/checkout', { maxRedirects: 0 });
  check(checkout.status() === 303, `Checkout returned ${checkout.status()}`);
  check((checkout.headers().location ?? '').startsWith('https://checkout.dodopayments.com/session/'), 'Checkout did not redirect to Dodo');
  const invalid = await context.request.get('https://api.sociobot.in/api/v1/products/line-take-match/verify?license=invalid-polish-1');
  const invalidBody = await invalid.json();
  check(invalid.status() === 200 && invalidBody.valid === false && invalidBody.reason === 'invalid', 'Invalid license response is wrong');
  const manifest = await context.request.get(`${base}/manifest.webmanifest`);
  check(manifest.headers()['content-type']?.startsWith('application/manifest+json'), 'Manifest MIME type is wrong');
  check(consoleErrors.length === 0, `Console errors: ${consoleErrors.join('; ')}`);

  const report = {
    checkedAt: new Date().toISOString(), base, viewport: '390x844', consoleErrors,
    demo: { sampleTakes: 3, firstViewportProof: true, realSentinelPreserved: true, resetRestoredSamples: true, clearedOnExit: true, offlineReload: true },
    checkout: { status: checkout.status(), hostedRedirect: true, invalidLicenseRejected: true },
    manifestContentType: manifest.headers()['content-type'], routes: routeChecks,
  };
  await writeFile(new URL('live-check.json', evidence), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
