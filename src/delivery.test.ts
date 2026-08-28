import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('static delivery policy', () => {
  it('keeps app assets immutable while update-sensitive files revalidate', async () => {
    const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as {
      routes: Array<{ route: string; headers: Record<string, string> }>;
    };
    const assetRoute = config.routes.find((route) => route.route === '/assets/*');
    const workerRoute = config.routes.find((route) => route.route === '/sw.js');

    expect(assetRoute?.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(workerRoute?.headers['Cache-Control']).toBe('no-cache');
  });

  it('does not precache Azure deployment metadata that the host does not serve', async () => {
    const injector = await readFile('scripts/inject-sw.mjs', 'utf8');
    expect(injector).toContain("!file.endsWith('staticwebapp.config.json')");
  });

  it('serves the designed not-found page with a real 404 response', async () => {
    const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as {
      navigationFallback?: unknown;
      responseOverrides?: Record<string, { rewrite: string; statusCode: number }>;
    };
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404/index.html', statusCode: 404 });
  });
});
