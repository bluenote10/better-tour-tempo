import type { Sequence } from "./sequence";

export function createDefault4BeatSequence(): Sequence {
  return {
    clicks: [
      { soundType: "synth2", beat: 0, volume: 1.0 },
      { soundType: "synth1", beat: 1, volume: 0.5 },
      { soundType: "synth1", beat: 2, volume: 1.0 },
      { soundType: "synth1", beat: 3, volume: 0.5 },
    ],
    maxBeat: 4,
  };
}
