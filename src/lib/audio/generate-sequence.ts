import type { Click, Sequence } from "./sequence";

function range(u: number, l: number = 0) {
  return [...Array(u - l).keys()].map((i) => i + l);
}

export function create2To1RatioSequence(emphasizeImpact: boolean): Sequence {
  const clicks: Click[] = [];

  clicks.push({ type: "perc_metronomequartz", beat: 0, volume: 1.2 });
  clicks.push({ type: "synth1", beat: 2, volume: 1.0 * (!emphasizeImpact ? 2 : 1) });
  clicks.push({ type: "perc_stick", beat: 3, volume: 1.0 * (emphasizeImpact ? 2 : 1) });

  if (emphasizeImpact) {
    const MAX_BEAT = 6;

    for (const b of range(MAX_BEAT)) {
      const emphasize = b % 3 == 0 ? 4 : 0.5;
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 * emphasize });
    }

    return {
      clicks,
      maxBeat: MAX_BEAT,
      perceivedBpmBeats: 3,
    };
  } else {
    const MAX_BEAT = 8;

    for (const b of range(MAX_BEAT)) {
      const emphasize = b % 2 == 0 ? 4 : 0.5;
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 * emphasize });
    }

    return {
      clicks,
      maxBeat: MAX_BEAT,
      perceivedBpmBeats: 2,
    };
  }
}

export function create3To1RatioSequence(emphasizeImpact: boolean): Sequence {
  const clicks: Click[] = [];

  clicks.push({ type: "perc_metronomequartz", beat: 0, volume: 1.2 });
  clicks.push({ type: "synth1", beat: 3, volume: 1.0 * (!emphasizeImpact ? 2 : 1) });
  clicks.push({ type: "perc_stick", beat: 4, volume: 1.0 * (emphasizeImpact ? 2 : 1) });

  if (emphasizeImpact) {
    const MAX_BEAT = 8;

    for (const b of range(MAX_BEAT)) {
      const emphasize = b % 4 == 0 ? 4 : 0.5;
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 * emphasize });
    }

    return {
      clicks,
      maxBeat: MAX_BEAT,
      perceivedBpmBeats: 4,
    };
  } else {
    const MAX_BEAT = 12;

    for (const b of range(MAX_BEAT)) {
      const emphasize = b % 3 == 0 ? 4 : 0.5;
      clicks.push({ type: "hi-hat1", beat: b, volume: 0.08 * emphasize });
    }

    return {
      clicks,
      maxBeat: MAX_BEAT,
      perceivedBpmBeats: 3,
    };
  }
}
