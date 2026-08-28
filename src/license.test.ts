import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearLicense, hasOptimisticUnlock, saveLicense, verifyLicense } from './license';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const storage = new MemoryStorage();

afterEach(() => {
  storage.clear();
  vi.unstubAllGlobals();
});

describe('license verification', () => {
  it('keeps a never-verified pasted token locked when verification is unavailable', async () => {
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    saveLicense('new-token');

    await expect(verifyLicense(true)).resolves.toBe('unavailable');
    expect(hasOptimisticUnlock()).toBe(false);
  });

  it('permits offline use only for the same token with a cached valid verdict', async () => {
    vi.stubGlobal('localStorage', storage);
    storage.setItem('sb_license:line-take-match', 'verified-token');
    storage.setItem('sb_license:line-take-match:verdict', JSON.stringify({ token: 'verified-token', valid: true, checkedAt: 0 }));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    expect(hasOptimisticUnlock()).toBe(true);
    await expect(verifyLicense(true)).resolves.toBe('valid');

    storage.setItem('sb_license:line-take-match', 'different-token');
    expect(hasOptimisticUnlock()).toBe(false);
    await expect(verifyLicense(true)).resolves.toBe('unavailable');
  });

  it('records an invalid response and does not unlock it', async () => {
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: false }), { status: 200 })));
    saveLicense('invalid-token');

    await expect(verifyLicense(true)).resolves.toBe('invalid');
    expect(hasOptimisticUnlock()).toBe(false);
    clearLicense();
  });
});
