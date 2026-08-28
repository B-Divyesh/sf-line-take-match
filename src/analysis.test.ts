import { describe, expect, it } from 'vitest';
import { analyzeSamples } from './analysis';
import { inferLineName } from './naming';
import { toCsv } from './export';
import type { Take } from './types';

describe('audio measurements', () => {
  it('measures duration, level, activity and stable pitch', () => {
    const sampleRate = 8_000;
    const samples = new Float32Array(sampleRate * 2);
    for (let index = sampleRate / 2; index < samples.length - sampleRate / 2; index += 1) {
      samples[index] = Math.sin(2 * Math.PI * 200 * index / sampleRate) * 0.5;
    }
    const metrics = analyzeSamples([samples], sampleRate);
    expect(metrics.duration).toBeCloseTo(2, 3);
    expect(metrics.pauseRatio).toBeGreaterThan(0.4);
    expect(metrics.pauseRatio).toBeLessThan(0.6);
    expect(metrics.loudness).toBeGreaterThan(-14);
    expect(metrics.pitchLow).toBeCloseTo(200, -1);
    expect(metrics.peaks).toHaveLength(64);
  });

  it('rejects empty audio', () => {
    expect(() => analyzeSamples([new Float32Array()], 48_000)).toThrow('no samples');
  });
});

describe('production helpers', () => {
  it.each([
    ['door-warning_take-03.wav', 'door warning'],
    ['Line_014_v2.mp3', 'Line 014'],
    ['hello.alt-4.ogg', 'hello'],
  ])('groups %s as %s', (filename, expected) => expect(inferLineName(filename)).toBe(expected));

  it('guards spreadsheet formulas in CSV exports', () => {
    const take = {
      id: '1', name: '=IMPORTXML()', line: 'Line 1', blob: null, mime: 'audio/wav', size: 0,
      createdAt: 0, reference: true, flagged: false, note: '+unsafe',
      metrics: { duration: 1, activeDuration: 1, pauseRatio: 0, loudness: -12, pitchLow: null, pitchHigh: null, pitchRange: null, peaks: [] },
    } satisfies Take;
    expect(toCsv([take])).toContain("'=IMPORTXML()");
    expect(toCsv([take])).toContain("'+unsafe");
  });
});
