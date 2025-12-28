import { MetronomeEngine } from "../metronome_engine";
import type { Sequence } from "../sequence";

/**
 * Svelte 5 runes-based state management for metronome
 */
class MetronomeState {
  private engine: MetronomeEngine | null = null;

  bpm = $state(120);
  volume = $state(1.0);
  isPlaying = $state(false);

  async init(sequence: Sequence): Promise<void> {
    if (!this.engine) {
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

  async switchSequence(sequence: Sequence): Promise<void> {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.engine?.stop();
      this.isPlaying = false;
    }

    if (this.engine) {
      this.engine.destroy();
    }
    this.engine = await MetronomeEngine.create(this.volume, sequence);
    this.engine.setBPM(this.bpm);

    if (wasPlaying) {
      this.engine.start();
      this.isPlaying = true;
    }
  }

  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
    }
  }
}

export const metronome = new MetronomeState();
