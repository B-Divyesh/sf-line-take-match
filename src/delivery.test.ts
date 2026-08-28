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
});
