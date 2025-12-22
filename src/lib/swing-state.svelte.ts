import { metronome } from "./audio/metronome-state.svelte";
import { create2To1RatioSequence, create3To1RatioSequence } from "./audio/default-sequence";
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
    this.ratioMode = mode;
    await metronome.switchSequence(this.currentSequence);
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
