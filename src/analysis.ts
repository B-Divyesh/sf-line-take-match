import type { AnalysisProgress, Metrics } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function analyzeSamples(
  channels: Float32Array[],
  sampleRate: number,
  onProgress?: AnalysisProgress,
): Metrics {
  const length = channels[0]?.length ?? 0;
  if (!length) throw new Error('This audio file contains no samples.');
  const mono = new Float32Array(length);
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < length; i += 1) {
    let sample = 0;
    for (const channel of channels) sample += channel[i] ?? 0;
    sample /= channels.length;
    mono[i] = sample;
    sumSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  const rms = Math.sqrt(sumSquares / length);
  const loudness = Math.max(-80, 20 * Math.log10(Math.max(rms, 0.0001)));
  const frameSize = Math.max(1, Math.round(sampleRate * 0.02));
  const threshold = Math.max(0.006, peak * 0.035);
  let activeFrames = 0;
  let totalFrames = 0;
  for (let start = 0; start < length; start += frameSize) {
    let frameSum = 0;
    const end = Math.min(length, start + frameSize);
    for (let i = start; i < end; i += 1) frameSum += mono[i] * mono[i];
    if (Math.sqrt(frameSum / (end - start)) >= threshold) activeFrames += 1;
    totalFrames += 1;
  }

  onProgress?.('Reading pitch movement…');
  const frequencies: number[] = [];
  const pitchWindow = Math.min(2048, 2 ** Math.floor(Math.log2(Math.max(256, length))));
  const hop = Math.max(pitchWindow, Math.round(sampleRate * 0.08));
  for (let start = 0; start + pitchWindow < length; start += hop) {
    const frequency = estimatePitch(mono.subarray(start, start + pitchWindow), sampleRate, threshold);
    if (frequency) frequencies.push(frequency);
  }
  frequencies.sort((a, b) => a - b);
  const pitchLow = percentile(frequencies, 0.1);
  const pitchHigh = percentile(frequencies, 0.9);
  const pitchRange = pitchLow && pitchHigh ? 12 * Math.log2(pitchHigh / pitchLow) : null;

  const peakCount = 64;
  const peaks = Array.from({ length: peakCount }, (_, index) => {
    const start = Math.floor((index * length) / peakCount);
    const end = Math.max(start + 1, Math.floor(((index + 1) * length) / peakCount));
    let localPeak = 0;
    for (let i = start; i < end; i += 1) localPeak = Math.max(localPeak, Math.abs(mono[i]));
    return peak ? localPeak / peak : 0;
  });

  const duration = length / sampleRate;
  const activeDuration = Math.min(duration, (activeFrames * frameSize) / sampleRate);
  return {
    duration,
    activeDuration,
    pauseRatio: clamp(1 - activeFrames / totalFrames, 0, 1),
    loudness,
    pitchLow,
    pitchHigh,
    pitchRange,
    peaks,
  };
}

function percentile(values: number[], fraction: number): number | null {
  if (!values.length) return null;
  return values[Math.min(values.length - 1, Math.floor(values.length * fraction))];
}

function estimatePitch(samples: Float32Array, sampleRate: number, silenceThreshold: number): number | null {
  let rms = 0;
  for (const sample of samples) rms += sample * sample;
  rms = Math.sqrt(rms / samples.length);
  if (rms < silenceThreshold) return null;

  const minLag = Math.floor(sampleRate / 500);
  const maxLag = Math.min(Math.floor(sampleRate / 70), samples.length - 2);
  let bestLag = -1;
  let bestCorrelation = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;
    for (let i = 0; i < samples.length - lag; i += 1) {
      correlation += samples[i] * samples[i + lag];
      energyA += samples[i] * samples[i];
      energyB += samples[i + lag] * samples[i + lag];
    }
    const normalized = correlation / Math.sqrt(energyA * energyB || 1);
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }
  return bestLag > 0 && bestCorrelation > 0.72 ? sampleRate / bestLag : null;
}

export async function analyzeFile(file: Blob, onProgress?: AnalysisProgress): Promise<Metrics> {
  onProgress?.('Decoding locally…');
  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
    return analyzeSamples(channels, buffer.sampleRate, onProgress);
  } catch (error) {
    throw new Error(error instanceof Error && error.message.includes('no samples')
      ? error.message
      : 'This file could not be decoded. Try a standard WAV, MP3, M4A, OGG, or FLAC file.');
  } finally {
    void context.close();
  }
}
