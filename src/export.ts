import type { Take } from './types';

const safe = (value: unknown) => {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function toCsv(takes: Take[]): string {
  const header = ['line', 'take', 'reference', 'flagged_for_review', 'note', 'duration_seconds', 'active_seconds', 'pause_percent', 'loudness_dbfs', 'pitch_low_hz', 'pitch_high_hz', 'pitch_range_semitones'];
  const rows = takes.map((take) => [
    take.line, take.name, take.reference ? 'yes' : 'no', take.flagged ? 'yes' : 'no', take.note,
    take.metrics.duration.toFixed(3), take.metrics.activeDuration.toFixed(3), (take.metrics.pauseRatio * 100).toFixed(1),
    take.metrics.loudness.toFixed(1), take.metrics.pitchLow?.toFixed(1) ?? '', take.metrics.pitchHigh?.toFixed(1) ?? '', take.metrics.pitchRange?.toFixed(1) ?? '',
  ]);
  return [header, ...rows].map((row) => row.map(safe).join(',')).join('\r\n');
}

export function download(text: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function makeBackup(takes: Take[]): Promise<string> {
  const records = await Promise.all(takes.map(async (take) => ({
    ...take,
    blob: take.blob ? await blobToDataUrl(take.blob) : null,
  })));
  return JSON.stringify({ format: 'line-take-match', version: 1, exportedAt: new Date().toISOString(), takes: records });
}

export async function readBackup(text: string): Promise<Take[]> {
  const data = JSON.parse(text) as { format?: string; version?: number; takes?: Array<Omit<Take, 'blob'> & { blob: string | null }> };
  if (data.format !== 'line-take-match' || data.version !== 1 || !Array.isArray(data.takes)) {
    throw new Error('That is not a Line Take Match v1 backup.');
  }
  return Promise.all(data.takes.map(async (take) => ({ ...take, blob: take.blob ? dataUrlToBlob(take.blob) : null })));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(value: string): Blob {
  const [meta, encoded] = value.split(',');
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? 'application/octet-stream';
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}
