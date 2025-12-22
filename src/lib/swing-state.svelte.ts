import { metronome } from "./audio/metronome-state.svelte";
import { create2To1RatioSequence, create3To1RatioSequence } from "./audio/generate-sequence";
import { msToBPM, frameNotationToMs } from "./audio/timing-utils";
import type { Sequence } from "./audio/sequence";

/**
 * Swing timing UI state management
 */
class SwingState {
  ratioMode = $state<2 | 3>(3);
  forwardSwingMs = $state(frameNotationToMs(7)); // Default: 21/7 preset

  get backwardSwingMs(): number {
    return this.forwardSwingMs * this.ratioMode;
  }

  get totalSwingMs(): number {
    return this.backwardSwingMs + this.forwardSwingMs;
  }

  get internalBPM(): number {
    return msToBPM(this.forwardSwingMs);
  }

  get displayBPM(): number {
    return msToBPM(this.totalSwingMs);
  }

  get currentSequence(): Sequence {
    return this.ratioMode === 2 ? create2To1RatioSequence() : create3To1RatioSequence();
  }

  async setRatioMode(mode: 2 | 3): Promise<void> {
    // Preserve total swing time when switching modes
    const currentTotal = this.totalSwingMs;
    this.ratioMode = mode;

    // Recalculate forward time to maintain same total
    // For 2:1: total = 2×forward + forward = 3×forward, so forward = total/3
    // For 3:1: total = 3×forward + forward = 4×forward, so forward = total/4
    const divisor = mode + 1;
    this.forwardSwingMs = currentTotal / divisor;

    await metronome.switchSequence(this.currentSequence);
    metronome.updateBPM(this.internalBPM);
  }

  async setForwardSwingMs(ms: number): Promise<void> {
    this.forwardSwingMs = ms;
    metronome.updateBPM(this.internalBPM);
  }

  async setBackwardSwingMs(ms: number): Promise<void> {
    this.forwardSwingMs = ms / this.ratioMode;
    metronome.updateBPM(this.internalBPM);
  }

  async loadPreset(forwardFrames: number): Promise<void> {
    const forwardMs = frameNotationToMs(forwardFrames);
    await this.setForwardSwingMs(forwardMs);
  }
}

export const swingState = new SwingState();
