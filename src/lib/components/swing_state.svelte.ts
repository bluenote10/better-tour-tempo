import { metronomeEngineState } from "./metronome_engine_state.svelte";
import { create2To1RatioSequence, create3To1RatioSequence } from "../sequence_generation";
import { msToBPM, frameNotationToMs } from "../timing_utils";

/**
 * Swing timing UI state management
 */
class SwingState {
  ratioMode = $state<2 | 3>(3);
  downswingTimeMs = $state(frameNotationToMs(7)); // Default: 21/7 preset
  emphasizeImpact = $state(true);

  currentSequence = $derived(
    this.ratioMode === 2
      ? create2To1RatioSequence(this.emphasizeImpact)
      : create3To1RatioSequence(this.emphasizeImpact),
  );

  get backswingTimeMs(): number {
    return this.downswingTimeMs * this.ratioMode;
  }

  get totalSwingTimeMs(): number {
    return this.backswingTimeMs + this.downswingTimeMs;
  }

  get internalBPM(): number {
    return msToBPM(this.downswingTimeMs);
  }

  get perceivedBPM(): number {
    return msToBPM(this.downswingTimeMs * this.currentSequence.perceivedBpmBeats);
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

    await metronomeEngineState.switchSequence(this.currentSequence);
    metronomeEngineState.updateBPM(this.internalBPM);
  }

  async setDownswingTimeMs(ms: number): Promise<void> {
    this.downswingTimeMs = ms;
    metronomeEngineState.updateBPM(this.internalBPM);
  }

  async setBackswingTimeMs(ms: number): Promise<void> {
    this.downswingTimeMs = ms / this.ratioMode;
    metronomeEngineState.updateBPM(this.internalBPM);
  }

  async setEmphasizeImpact(value: boolean): Promise<void> {
    this.emphasizeImpact = value;
    await metronomeEngineState.switchSequence(this.currentSequence);
  }

  async loadPreset(downswingFrames: number): Promise<void> {
    await this.setDownswingTimeMs(frameNotationToMs(downswingFrames));
  }
}

export const swingState = new SwingState();
