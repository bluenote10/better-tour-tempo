import type { Click, Sequence } from "./sequence";

export class ClickIterator {
  private readonly sortedClicks: Click[];
  private readonly maxBeat: number;
  private currentIndex = 0;
  private loopCount = 0;
  private lastBeatUpto = 0;

  constructor(sequence: Sequence) {
    // Sort clicks by beat time for efficient iteration
    this.sortedClicks = [...sequence.clicks].sort((a, b) => a.beat - b.beat);
    this.maxBeat = sequence.maxBeat;
  }

  /**
   * Returns all clicks in the range [currentBeat, beatUpto).
   * Returned clicks have their 'beat' field set to absolute beat positions.
   * Updates internal state for next call.
   * NOTE: beatUpto must be >= last beatUpto (monotonically increasing).
   * If beatUpto < last beatUpto, returns empty array without updating state.
   */
  getClicksUpto(beatUpto: number): Click[] {
    // Non-monotonic check - return empty without updating state
    if (beatUpto < this.lastBeatUpto) {
      return [];
    }

    this.lastBeatUpto = beatUpto;

    if (this.maxBeat === 0 || this.sortedClicks.length === 0) {
      return [];
    }

    const result: Click[] = [];

    // Iterate through clicks until we reach beatUpto
    while (true) {
      const click = this.sortedClicks[this.currentIndex];
      const absoluteBeat = this.loopCount * this.maxBeat + click.beat;

      if (absoluteBeat >= beatUpto) {
        break;
      }

      // Add click with absolute beat position
      result.push({
        ...click,
        beat: absoluteBeat,
      });

      // Advance to next click, wrapping around if needed
      this.currentIndex++;
      if (this.currentIndex >= this.sortedClicks.length) {
        this.currentIndex = 0;
        this.loopCount++;
      }
    }

    return result;
  }

  /**
   * Resets the iterator state to beat 0.
   */
  reset(): void {
    this.currentIndex = 0;
    this.loopCount = 0;
    this.lastBeatUpto = 0;
  }
}
