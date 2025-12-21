import { MetronomeEngine, type SoundType } from "./metronome-engine";

/**
 * Svelte 5 runes-based state management for metronome
 */
class MetronomeState {
  private engine: MetronomeEngine | null = null;

  bpm = $state(120);
  volume = $state(0.7);
  isPlaying = $state(false);
  soundType = $state<SoundType>("synth1");

  async init(): Promise<void> {
    if (!this.engine) {
      this.engine = await MetronomeEngine.create(this.volume);
    }
  }

  togglePlay(): void {
    if (!this.engine) return;

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
    if (this.engine) {
      this.engine.setBPM(newBPM);
    }
  }

  updateVolume(newVolume: number): void {
    this.volume = newVolume;
    if (this.engine) {
      this.engine.setVolume(newVolume);
    }
  }

  updateSoundType(type: SoundType): void {
    this.soundType = type;
    if (this.engine) {
      this.engine.setSoundType(type);
    }
  }

  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
    }
  }
}

export const metronome = new MetronomeState();
