import type { Click, Sequence } from "./sequence";

function range(u: number, l: number = 0) {
  return [...Array(u - l).keys()].map((i) => i + l);
}

export function create2To1RatioSequence(): Sequence {
  const clicks: Click[] = [];

  clicks.push({ soundType: "synth2", beat: 0, volume: 1.0 });
  clicks.push({ soundType: "synth2", beat: 2, volume: 1.0 });
  clicks.push({ soundType: "synth2", beat: 3, volume: 1.0 });

  for (const b of range(8)) {
    clicks.push({ soundType: "hi-hat1", beat: b, volume: 0.1 });
  }

  return {
    clicks,
    maxBeat: 8,
  };
}

export function create3To1RatioSequence(): Sequence {
  const clicks: Click[] = [];

  clicks.push({ soundType: "synth2", beat: 0, volume: 1.0 });
  clicks.push({ soundType: "synth2", beat: 3, volume: 1.0 });
  clicks.push({ soundType: "synth2", beat: 4, volume: 1.0 });

  for (const b of range(8)) {
    clicks.push({ soundType: "hi-hat1", beat: b, volume: 0.1 });
  }

  return {
    clicks,
    maxBeat: 8,
  };
}
