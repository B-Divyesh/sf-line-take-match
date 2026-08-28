export const PRODUCT_SLUG = 'line-take-match';
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const BILLING_BASE = 'https://api.sociobot.in/api/v1';

interface CachedVerdict { valid: boolean; checkedAt: number }

export const checkoutUrl = `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
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
  return verdict?.valid !== false;
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return false;
  const cached = readVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  try {
    const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return result.valid;
  } catch {
    return cached?.valid ?? true;
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
