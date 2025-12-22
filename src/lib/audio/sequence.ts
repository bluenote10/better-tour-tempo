import type { SoundType } from "./metronome-engine";

export interface Click {
  soundType: SoundType;
  beat: number;
  volume: number; // 0.0 - 1.0
}

export interface Sequence {
  clicks: Click[];
  maxBeat: number;
}
