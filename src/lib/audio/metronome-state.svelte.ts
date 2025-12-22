import { MetronomeEngine } from "./metronome-engine";
import { createDefault4BeatSequence } from "./default-sequence";

/**
 * Svelte 5 runes-based state management for metronome
 */
class MetronomeState {
  private engine: MetronomeEngine | null = null;

  bpm = $state(120);
  volume = $state(0.7);
  isPlaying = $state(false);

  async init(): Promise<void> {
    if (!this.engine) {
      const sequence = createDefault4BeatSequence();
      this.engine = await MetronomeEngine.create(this.volume, sequence);
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

  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
    }
  }
}

export const metronome = new MetronomeState();
