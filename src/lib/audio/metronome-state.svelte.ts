import { MetronomeEngine, type SoundType } from "./metronome-engine";

/**
 * Svelte 5 runes-based state management for metronome
 */
class MetronomeState {
  private engine = new MetronomeEngine();
  private initialized = $state(false);

  bpm = $state(120);
  isPlaying = $state(false);
  soundType = $state<SoundType>("synth1");

  async init(): Promise<void> {
    if (!this.initialized) {
      await this.engine.init();
      this.initialized = true;
    }
  }

  async loadSample(url: string): Promise<void> {
    await this.engine.loadClickSample(url);
  }

  togglePlay(): void {
    if (!this.initialized) return;

    if (this.isPlaying) {
      this.engine.stop();
      this.isPlaying = false;
    } else {
      this.engine.start();
      this.isPlaying = true;
    }
  }

  updateBPM(newBPM: number): void {
    this.bpm = newBPM;
    this.engine.setBPM(newBPM);
  }

  updateSoundType(type: SoundType): void {
    this.soundType = type;
    this.engine.setSoundType(type);
  }

  destroy(): void {
    this.engine.destroy();
  }
}

export const metronome = new MetronomeState();
