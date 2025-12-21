/**
 * Web Audio API-based metronome engine with precise timing
 * Uses look-ahead scheduling for sub-millisecond accuracy
 */

import { generateClickBuffer } from "./generate-click";

export type SoundType = "synth1" | "synth2" | "sample";

export class MetronomeEngine {
  private readonly audioContext: AudioContext;
  private readonly masterGain: GainNode;
  private readonly generatedClickBuffer: AudioBuffer;
  private readonly sampleClickBuffer: AudioBuffer;

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

  private constructor(
    audioContext: AudioContext,
    masterGain: GainNode,
    generatedClickBuffer: AudioBuffer,
    sampleClickBuffer: AudioBuffer,
  ) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
    this.generatedClickBuffer = generatedClickBuffer;
    this.sampleClickBuffer = sampleClickBuffer;
  }

  static async create(initialVolume: number): Promise<MetronomeEngine> {
    const audioContext = new AudioContext();
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = initialVolume;

    const generatedClickBuffer = generateClickBuffer(audioContext);
    const sampleClickBuffer = await MetronomeEngine.loadClickSample(
      audioContext,
      "/548508__perc_clicktoy_hi.wav",
    );

    return new MetronomeEngine(audioContext, masterGain, generatedClickBuffer, sampleClickBuffer);
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

    // Resume AudioContext if suspended (required by browser autoplay policies)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioContext.currentTime;

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
    const clampedVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
    this.masterGain.gain.value = clampedVolume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getBPM(): number {
    return this.bpm;
  }

  private scheduler(): void {
    // Schedule all notes that need to play before the next interval
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime, this.currentBeat);
      this.advanceNote();
    }
  }

  private scheduleNote(time: number, beat: number): void {
    if (this.soundType === "synth1") {
      this.playSynthClick(time, beat);
    } else if (this.soundType === "synth2") {
      this.playBufferClick(time, this.generatedClickBuffer);
    } else if (this.soundType === "sample") {
      this.playBufferClick(time, this.sampleClickBuffer);
    }
  }

  private playSynthClick(time: number, beat: number): void {
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

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
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
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
    this.audioContext.close();
  }
}
