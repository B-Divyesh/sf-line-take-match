export const PRODUCT_SLUG = 'line-take-match';
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const BILLING_BASE = 'https://api.sociobot.in/api/v1';

interface CachedVerdict { token: string; valid: boolean; checkedAt: number }

export type LicenseVerification = 'valid' | 'invalid' | 'unavailable';

export const checkoutUrl = `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  // A return URL is still untrusted browser input. Keep the token so that the
  // normal verification can complete, but do not manufacture a valid verdict.
  saveLicense(token);
  url.searchParams.delete('license');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export function saveLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function hasOptimisticUnlock(): boolean {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return false;
  const verdict = readVerdict();
  return verdict?.token === token && verdict.valid;
}

export async function verifyLicense(force = false): Promise<LicenseVerification> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return 'invalid';
  const cached = readVerdict();
  const matchingCached = cached?.token === token ? cached : null;
  if (!force && matchingCached && Date.now() - matchingCached.checkedAt < 86_400_000) {
    return matchingCached.valid ? 'valid' : 'invalid';
  }
  try {
    const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ token, valid: result.valid, checkedAt: Date.now() }));
    return result.valid ? 'valid' : 'invalid';
  } catch {
    // Offline use is deliberately optimistic only for a token this device has
    // already verified as valid. A pasted or URL-supplied token stays locked.
    return matchingCached?.valid ? 'valid' : 'unavailable';
  }
}

function readVerdict(): CachedVerdict | null {
  try {
    const value = localStorage.getItem(VERDICT_KEY);
    return value ? JSON.parse(value) as CachedVerdict : null;
  } catch {
    return null;
  }
}
