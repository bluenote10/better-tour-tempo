import { MetronomeEngine, type SoundType } from "./metronome-engine";

/**
 * Svelte 5 runes-based state management for metronome
 */
class MetronomeState {
  private engine = new MetronomeEngine();
  private initialized = $state(false);

  bpm = $state(120);
  volume = $state(0.7);
  isPlaying = $state(false);
  soundType = $state<SoundType>("synth1");

  async init(): Promise<void> {
    if (!this.initialized) {
      await this.engine.init();
      this.initialized = true;
    }
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

  updateVolume(newVolume: number): void {
    this.volume = newVolume;
    this.engine.setVolume(newVolume);
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
