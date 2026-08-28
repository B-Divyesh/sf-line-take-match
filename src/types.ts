export interface Metrics {
  duration: number;
  activeDuration: number;
  pauseRatio: number;
  loudness: number;
  pitchLow: number | null;
  pitchHigh: number | null;
  pitchRange: number | null;
  peaks: number[];
}

export interface Take {
  id: string;
  name: string;
  line: string;
  blob: Blob | null;
  mime: string;
  size: number;
  createdAt: number;
  metrics: Metrics;
  reference: boolean;
  flagged: boolean;
  note: string;
  missingAudio?: boolean;
}

export type AnalysisProgress = (message: string) => void;
