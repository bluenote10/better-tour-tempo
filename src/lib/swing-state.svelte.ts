import { metronome } from "./audio/metronome-state.svelte";
import { create2To1RatioSequence, create3To1RatioSequence } from "./audio/generate-sequence";
import { msToBPM, frameNotationToMs } from "./audio/timing-utils";
import type { Sequence } from "./audio/sequence";

/**
 * Swing timing UI state management
 */
class SwingState {
  ratioMode = $state<2 | 3>(3);
  downswingTimeMs = $state(frameNotationToMs(7)); // Default: 21/7 preset

  get backswingTimeMs(): number {
    return this.downswingTimeMs * this.ratioMode;
  }

  get totalSwingTimeMs(): number {
    return this.backswingTimeMs + this.downswingTimeMs;
  }

  get internalBPM(): number {
    return msToBPM(this.downswingTimeMs);
  }

  get displayBPM(): number {
    return msToBPM(this.totalSwingTimeMs);
  }

  get currentSequence(): Sequence {
    return this.ratioMode === 2 ? create2To1RatioSequence() : create3To1RatioSequence();
  }

  async setRatioMode(mode: 2 | 3): Promise<void> {
    // Preserve total swing time when switching modes
    const currentTotal = this.totalSwingTimeMs;
    this.ratioMode = mode;

    // Recalculate downswing time to maintain same total
    // For 2:1: total = 2×downswing + downswing = 3×downswing, so downswing = total/3
    // For 3:1: total = 3×downswing + downswing = 4×downswing, so downswing = total/4
    const divisor = mode + 1;
    this.downswingTimeMs = currentTotal / divisor;

    await metronome.switchSequence(this.currentSequence);
    metronome.updateBPM(this.internalBPM);
  }

  async setDownswingTimeMs(ms: number): Promise<void> {
    this.downswingTimeMs = ms;
    metronome.updateBPM(this.internalBPM);
  }

  async setBackswingTimeMs(ms: number): Promise<void> {
    this.downswingTimeMs = ms / this.ratioMode;
    metronome.updateBPM(this.internalBPM);
  }

  async loadPreset(downswingFrames: number): Promise<void> {
    await this.setDownswingTimeMs(frameNotationToMs(downswingFrames));
  }
}

export const swingState = new SwingState();
