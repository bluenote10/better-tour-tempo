/**
 * Web Audio API-based metronome engine with precise timing
 * Uses look-ahead scheduling for sub-millisecond accuracy
 */

import { generateClickBuffer } from "./generate-click";

export type SoundType = "synth1" | "synth2" | "sample";

interface Context {
  audioContext: AudioContext;
  masterGain: GainNode;
  generatedClickBuffer: AudioBuffer;
  sampleClickBuffer: AudioBuffer;
}

export class MetronomeEngine {
  private context: Context | null = null;
  private schedulerIntervalId: number | null = null;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private isPlaying = false;

  // Scheduling parameters
  private readonly scheduleAheadTime = 0.1; // Schedule 100ms ahead
  private readonly lookahead = 25; // Check every 25ms

  // Metronome parameters
  private bpm = 120;
  private beatsPerMeasure = 4;
  private soundType: SoundType = "synth1";
  private volume = 0.7; // 0-1 range

  constructor() {}

  async init(): Promise<void> {
    const audioContext = new AudioContext();
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = this.volume;

    const generatedClickBuffer = generateClickBuffer(audioContext);
    const sampleClickBuffer = await MetronomeEngine.loadClickSample(
      audioContext,
      "/548508__perc_clicktoy_hi.wav",
    );

    this.context = {
      audioContext,
      masterGain,
      generatedClickBuffer,
      sampleClickBuffer,
    };
  }

  private static async loadClickSample(
    audioContext: AudioContext,
    url: string,
  ): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  start(): void {
    if (this.isPlaying) return;
    if (!this.context) throw new Error("AudioContext not initialized");

    // Resume AudioContext if suspended (required by browser autoplay policies)
    if (this.context.audioContext.state === "suspended") {
      this.context.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.context.audioContext.currentTime;

    this.schedulerIntervalId = window.setInterval(() => {
      this.scheduler();
    }, this.lookahead);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.schedulerIntervalId !== null) {
      clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
  }

  setBPM(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm)); // Clamp between 20-300
  }

  setSoundType(type: SoundType): void {
    this.soundType = type;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
    if (this.context) {
      this.context.masterGain.gain.value = this.volume;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getBPM(): number {
    return this.bpm;
  }

  getVolume(): number {
    return this.volume;
  }

  private scheduler(): void {
    if (!this.context) return;

    // Schedule all notes that need to play before the next interval
    while (this.nextNoteTime < this.context.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime, this.currentBeat);
      this.advanceNote();
    }
  }

  private scheduleNote(time: number, beat: number): void {
    if (!this.context) return;

    if (this.soundType === "synth1") {
      this.playSynthClick(time, beat);
    } else if (this.soundType === "synth2") {
      this.playBufferClick(time, this.context.generatedClickBuffer);
    } else if (this.soundType === "sample") {
      this.playBufferClick(time, this.context.sampleClickBuffer);
    }
  }

  private playSynthClick(time: number, beat: number): void {
    if (!this.context) return;

    const osc = this.context.audioContext.createOscillator();
    const gainNode = this.context.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.context.masterGain);

    // First beat of measure is accented (higher pitch)
    const frequency = beat === 0 ? 1000 : 800;
    osc.frequency.value = frequency;

    // Short click envelope (normalized to match other sounds)
    gainNode.gain.setValueAtTime(1.0, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  private playBufferClick(time: number, buffer: AudioBuffer): void {
    if (!this.context) return;

    const source = this.context.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.masterGain);
    source.start(time);
  }

  private advanceNote(): void {
    // Calculate seconds per beat
    const secondsPerBeat = 60.0 / this.bpm;

    // Advance to next note
    this.nextNoteTime += secondsPerBeat;

    // Advance beat counter (circular within measure)
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
  }

  destroy(): void {
    this.stop();
    if (this.context) {
      this.context.audioContext.close();
      this.context = null;
    }
  }
}
