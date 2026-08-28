import type { Metrics, Take } from './types';

const waveform = (offset: number) => Array.from({ length: 64 }, (_, index) =>
  Math.max(0.08, Math.min(1, 0.22 + Math.abs(Math.sin((index + offset) * 0.31)) * 0.68)),
);

function wavBlob(frequency: number, seconds: number, pauseStart: number, pauseEnd: number): Blob {
  const sampleRate = 8_000;
  const count = Math.round(sampleRate * seconds);
  const buffer = new ArrayBuffer(44 + count * 2);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, count * 2, true);
  for (let index = 0; index < count; index += 1) {
    const time = index / sampleRate;
    const quiet = time < 0.08 || time > seconds - 0.08 || (time >= pauseStart && time <= pauseEnd);
    const sample = quiet ? 0 : Math.sin(2 * Math.PI * frequency * time) * 0.34;
    view.setInt16(44 + index * 2, Math.round(sample * 32_767), true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

function metrics(duration: number, pauseRatio: number, loudness: number, pitchRange: number, offset: number): Metrics {
  return {
    duration,
    activeDuration: duration * (1 - pauseRatio),
    pauseRatio,
    loudness,
    pitchLow: 176 + offset * 8,
    pitchHigh: (176 + offset * 8) * (2 ** (pitchRange / 12)),
    pitchRange,
    peaks: waveform(offset),
  };
}

export function makeDemoTakes(): Take[] {
  return [
    {
      id: 'demo-door-01', name: 'door-warning_take-01', line: 'door warning', blob: wavBlob(184, 1.84, 0.74, 1.15),
      mime: 'audio/wav', size: 29_484, createdAt: 1, metrics: metrics(1.84, 0.23, -15.2, 5.2, 1),
      reference: true, flagged: false, note: 'Approved read: calm, then urgent.',
    },
    {
      id: 'demo-door-02', name: 'door-warning_take-02', line: 'door warning', blob: wavBlob(212, 2.16, 0.67, 1.28),
      mime: 'audio/wav', size: 34_604, createdAt: 2, metrics: metrics(2.16, 0.31, -11.8, 6.1, 4),
      reference: false, flagged: false, note: 'Longer pause before “door”.',
    },
    {
      id: 'demo-door-03', name: 'door-warning_take-03', line: 'door warning', blob: wavBlob(246, 1.38, 0.54, 0.63),
      mime: 'audio/wav', size: 22_124, createdAt: 3, metrics: metrics(1.38, 0.08, -19.1, 9.4, 7),
      reference: false, flagged: true, note: 'Review: faster and wider pitch range.',
    },
  ];
}
