import type { Click, Sequence } from "./sequence";

function range(u: number, l: number = 0) {
  return [...Array(u - l).keys()].map((i) => i + l);
}

export function create2To1RatioSequence(emphasizeImpact: boolean): Sequence {
  const clicks: Click[] = [];

  if (emphasizeImpact) {
    clicks.push({ type: "perc_metronomequartz", beat: 0, volume: 1.2 });
    clicks.push({ type: "synth1", beat: 2, volume: 1.0 });
    clicks.push({ type: "perc_stick", beat: 3, volume: 1.0 });

    for (const b of range(8)) {
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 });
    }

    return {
      clicks,
      maxBeat: 6,
    };
  } else {
    clicks.push({ type: "perc_metronomequartz", beat: 0, volume: 1.2 });
    clicks.push({ type: "synth1", beat: 2, volume: 1.0 });
    clicks.push({ type: "perc_stick", beat: 3, volume: 1.0 });

    for (const b of range(8)) {
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 });
    }

    return {
      clicks,
      maxBeat: 8,
    };
  }
}

export function create3To1RatioSequence(emphasizeImpact: boolean): Sequence {
  const clicks: Click[] = [];

  if (emphasizeImpact) {
    clicks.push({ type: "perc_metronomequartz", beat: 0, volume: 1.2 });
    clicks.push({ type: "synth1", beat: 3, volume: 1.0 });
    clicks.push({ type: "perc_stick", beat: 4, volume: 1.0 });

    for (const b of range(8)) {
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 });
    }

    return {
      clicks,
      maxBeat: 8,
    };
  } else {
    clicks.push({ type: "perc_metronomequartz", beat: 0, volume: 1.2 });
    clicks.push({ type: "synth1", beat: 3, volume: 1.0 });
    clicks.push({ type: "perc_stick", beat: 4, volume: 1.0 });

    for (const b of range(8)) {
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 });
    }

    return {
      clicks,
      maxBeat: 12,
    };
  }
}
